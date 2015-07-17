var _ = require('lodash'),
    Action = require('./Action'),
    Player = require('./Player'),
    MathUtil = require('../MathUtil'),
    PickOrdersComponent = typeof window !== 'undefined' ? require('./component/PickOrders') : null;

var Game = function(gameDoc, actionDocs, playerId, server, options) {
    options = options || {};

    //
    // PRIVATE MEMBER DECLARATIONS //
    var actions,
        actionIndex = 0,
        serverMoves = [],
        logs = [],
        players = [],
        thisPlayer,
        playerOrder,
        round = 0;

    //
    // PUBLIC METHOD DECLARATIONS //
    /**
     * getLog
     * Fetches the array of log messages.
     * @returns {Array} Message strings.
     */
    this.getLog = function(){
        return logs;
    };

    /**
     * getServerMoves
     * Returns the list of actions the server should take.
     * @returns {Array}
     */
    this.getServerMoves = function(){
        return serverMoves;
    };

    /**
     * getPlayerDirective
     * Returns the instructions for the player.
     * @returns {Array}
     */
    this.getPlayerDirective = function(){
        return thisPlayer.getDirective();
    };

    /**
     * makePlayerMove
     * Records a move for the active player
     * @param data
     */
    this.makePlayerMove = function(data){
        makePlayerMove(data);
    };

    this.isLegal = function(move){
        return true;
    };

    //
    // PRIVATE METHOD DECLARATIONS //
    /**
     * Kicks off gameplay. This method cycles through the entire game until one of the phases return false, meaning it's awaiting more data (server or player move)
     */
    var play = function() {
        var buildingPhases = [newRoundPhase, ordersPhase, productionPhase, eventPhase, adventurersPhase];
        var roundPhases = [].concat(buildingPhases, buildingPhases, buildingPhases, buildingPhases, [endOfRound, combat]);
        var gameSequence = [pickStartingPlayerAndInitialOrders].concat(roundPhases, roundPhases, [endOfGame]);
        for (var step = 0; step < gameSequence.length; step++) {
            if (!gameSequence[step].apply(this)) {
                break;
            }
        }
    };

    /**
     * Sets a move the server should make. These are placed in a queue and executed by the server.
     * @param data The action you got from calling .create() on a Action[] object.
     */
    var makeServerMove = function(data) {
        if (options.isServer) {
            serverMoves.push(data.serialize());
        }
    };

    /**
     * Records a move for the active player
     * @param data
     */
    var makePlayerMove = function(data) {

    };

    /**
     * Filters the action queue for a specific type of action. This is how we replay game events to create mid-game state.
     * @param type The Game.Move value type you are searching for.
     * @param options There are different strategies that can be used to fetch actions depending on the circumstances.
     * @returns {Object|Array} The filtered action(s) from the database.
     */
    var getActions = function (type, options) {
        var filteredActions = [];
        for (var i = actionIndex; i < actions.length; i++) {
            if (actions[i].type === type) {
                filteredActions.push(Action[type].deserialize(actions[i]));
                actionIndex = i + 1;
                if (options.one) {
                    break;
                }
            }
        }
        return options.one ? (filteredActions.length ? filteredActions[0] : null) : filteredActions;
    };

    /**
     * Appends messages to the game log.
     * @param message The message to append.
     * @param arr An optional array that will be stringified.
     */
    var log = function(message, arr) {
        if (!options.isServer) {
            logs.push(message + (arr ? arr.join(', ') : ''));
        }
    };

    /**
     * Assigns player order and shuffles/deals initial orders (and initially held orders for dummy players)
     */
    var pickStartingPlayerAndInitialOrders = function () {
        log('The Ministry of Dungeons welcomes you to a trial for your dungeon lord license. Have fun! Let the evil flow.');

        // Determine player order
        var playerOrder = getActions(Action.Type.ASSIGN_PLAYER_ORDER, {one: true});
        if (!playerOrder) {
            if (!options.isServer) {
                return false;
            }
            var playerIds = [];
            for (var i = 0; i < players.length; i++) {
                playerIds.push(players[i].getId());
            }
            playerOrder = _.shuffle(playerIds);
            makeServerMove(Action[Action.Type.ASSIGN_PLAYER_ORDER].create(playerOrder));
        }
        log('The Ministry has randomly determined that the player order shall be: ', playerOrder);

        // Determine the three actions you draw at the beginning of the game, to pick two held orders
        var initialOrders = getActions(Action.Type.ASSIGN_INITIAL_ORDERS, {one: true});
        if (!initialOrders) {
            var initialOrdersAction = Action[Action.Type.ASSIGN_INITIAL_ORDERS].create();
            players.forEach(function(player) {
                initialOrdersAction.addPlayer(player.getId(), MathUtil.randomUniqueArray(3, 1, 8))
            });

            // Dummy players initial inaccessible orders are chosen at this time
            if (players.length === 2) {
                players.forEach(function (player) {
                    initialOrdersAction.addDummyPlayer(MathUtil.randomUniqueArray(3, 1, 8), player.getId());
                });
            } else {
                initialOrdersAction.addDummyPlayer(MathUtil.randomUniqueArray(3, 1, 8));
            }
            makeServerMove(initialOrdersAction);
            return false;
        }
        log('Initial orders have been given to all players.');

        var heldOrdersActions = getActions(Action.Type.SELECT_INITIAL_ORDERS);
        if (heldOrdersActions.length !== players.length) {
            players.forEach(function(player){
                if (_.find(heldOrdersActions, { id: player.getId() })) {
                    player.isWaiting();
                } else {
                    player.setDirective({
                        component: PickOrdersComponent,
                        props: {
                            mode: 'initial',
                            orders: initialOrders.getInitialOrders(player.getId()),
                            onSubmit: makePlayerMove.bind(this)
                        }
                    });
                }
            }.bind(this));
            return false;
        }

        var revealHeldOrdersAction = getActions(Action.Type.REVEAL_INITIAL_ORDERS, { one: true });
        if (!revealHeldOrdersAction) {
            revealHeldOrdersAction = Action[Action.Type.REVEAL_INITIAL_ORDERS].create();
            players.forEach(function(player){
                revealHeldOrdersAction.addPlayer(player.getId(), _.find(heldOrdersActions, { id: player.getId() }).orders);
            });
            makeServerMove(revealHeldOrdersAction);
            return false;
        }

        players.forEach(function(player){
            player.setHeldOrders(revealHeldOrdersAction.getRevealedInitialOrders(player.getId()));
            log(player.getName() + ' chose to have the following orders inaccessible:', player.getHeldOrders());
        });

        return true;
    };

    var newRoundPhase = function(){
        var revealedData = getActions(Action.Type.REVEAL_NEW_ROUND_DATA, { one: true });
        if (!revealedData) {
            return false;
        }
        log('Round ' + round + ' begins! The Ministry has made new choices available on the board.')
    };

    var ordersPhase = function(){
        return false;
    };

    var productionPhase = function(){
        return false;
    };

    var eventPhase = function(){
        return false;
    };

    var adventurersPhase = function(){
        return false;
    };

    var endOfRound = function(){
        return false;
    };

    var combat = function(){
        return false;
    };

    var endOfGame = function(){
        return false;
    };

    //
    // INITIALIZATION -- Start here! //
    actions = actionDocs.sort(function (a, b) {
        return Date.parse(a.created) - Date.parse(b.created);
    });

    for (var i = 0; i < gameDoc.players.length; i++) {
        var playerHolder = new Player('name', gameDoc.players[i].id);
        if (playerId === gameDoc.players[i].id) {
            thisPlayer = playerHolder;
        }
        players.push(playerHolder);
    }

    play();
};

/*var dummyOrderResolver = function(){
    var board = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];

    _.times(4 - this.players.length, function(dummyIndex){
        this.dummyOrders[dummyIndex].forEach(function(order){
            var spot2 = board[order-1][1];
            if (spot2) {
                board[order-1][2] = dummyIndex + 1;
            } else {
                board[order-1][1] = dummyIndex + 1;
            }
        })
    }.bind(this));

    return board;
};

var orderResolver = function(){
    if (this.phaseTrack.year === 0) {
        return;
    }

    var board = this.dummyOrderResolver();

    var playerOrder = _.pluck(this.players, 'order').sort();

    // in a two player game, the players select the final dummy order from the dummy's leftover cards,
    // this is the last order in their order array
    if (this.players.length === 2) {
        board[this.lookupPlayer[playerOrder[0]].orders[3]-1] = 3; // 3 = player 1's dummy designation
        board[this.lookupPlayer[playerOrder[1]].orders[3]-1] = 4; // 4 = player 2's dummy designation
    }

    // real players
    _.times(3, function(orderIndex){
        playerOrder.forEach(function(id){
            var order = this.lookupPlayer[id].orders[orderIndex];
            if (board[order-1][0] === 0) {
                board[order-1][0] = id;
            } else if (board[order-1][1] === 0) {
                board[order-1][1] = id;
            } else if (board[order-1][2] === 0) {
                board[order-1][2] = id;
            } else {
                this.lookupPlayer[id].didnotuse.push(order);
            }
        }.bind(this));
    }.bind(this));
};*/


module.exports = Game;