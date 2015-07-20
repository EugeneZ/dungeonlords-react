var _ = require('lodash'),
    Action = require('./Action'),
    Player = require('./Player'),
    MathUtil = require('../MathUtil');

    /*
    These are React components that we don't want to load on the server side because they are used for player display. We could use a function to save us some boilerplate
    code, but that would defeat browserify's ability to inline these components. So we don't do that.
    */
var PlayerBoardsComponent = typeof window !== 'undefined' ? require('./component/PlayerBoards') : null,
    PickOrdersComponent = typeof window !== 'undefined' ? require('./component/PickOrders') : null;

var Game = function(gameDoc, actionDocs, playerId, remotePush, options) {
    options = options || {
            isServer: false,             // If set to true, certain routines that are only useful for players are skipped, and vice-versa
            skipPlay: false              // If set to true, skips running the play() method. Useful to avoid pointless calculations when you are about to call pushActions()
        };

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
     * Gets the game id.
     * @returns {String} id
     */
    this.getId = function(){
        return gameDoc._id;
    };

    /**
     * Gets the game title.
     * @returns {String} title
     */
    this.getTitle = function(){
        return gameDoc.title;
    };

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
     * Returns the React component and props for the player.
     * @returns {Array}
     */
    this.getPlayerDirective = function(){
        return thisPlayer.getDirective();
    };

    this.pushActions = function(actionsArray){
        if (actionsArray.length) {
            actions = actions.concat(actionsArray);
            initialize();
        }
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
     * Records a move action for the active player
     * @param action
     */
    var makePlayerMove = function(action) {
        remotePush(action.serialize());
    };

    /**
     * Filters the action queue for a specific type of action. This is how we replay game events to create mid-game state.
     * @param type The Game.Move value type you are searching for.
     * @param options There are different strategies that can be used to fetch actions depending on the circumstances.
     * @returns {Object|Array} The filtered action(s) from the database.
     */
    var getActions = function (type, options) {
        var filteredActions = [], options = options || {};
        for (var i = actionIndex; i < actions.length; i++) {
            if (actions[i].action === type) {
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

    var mixinCommonProps = function(props) {
        return _.mixin({
            players: players,
            currentPlayer: thisPlayer
        }, props || {});
    };

    /**
     * Assigns player order and shuffles/deals initial orders (and initially held orders for dummy players)
     */
    var pickStartingPlayerAndInitialOrders = function () {
        log('The Ministry of Dungeons welcomes you to a trial for your dungeon lord license. Have fun!');

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
        log('The Ministry has randomly determined that the player order shall be: ',
            playerOrder.map(function(playerId){
                return _.find(players, function(player){ return player.getId() === playerId; }).getName();
            }));

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
                    player.setWaiting();
                } else {
                    player.setDirective({
                        component: PickOrdersComponent,
                        props: mixinCommonProps({
                            mode: 'initial',
                            orders: initialOrders.getInitialOrders(player.getId()),
                            onSubmit: function(orders) {
                                makePlayerMove(Action[Action.Type.SELECT_INITIAL_ORDERS].create(thisPlayer.getId(), orders));
                            }
                        })
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
    var initialize = function(){

        actionIndex = 0;
        serverMoves = [];
        logs = [];
        players = [];
        round = 0;

        for (var i = 0; i < gameDoc.players.length; i++) {
            var playerHolder = new Player(gameDoc.players[i]);
            if (playerId === gameDoc.players[i].id) {
                thisPlayer = playerHolder;
                playerHolder.setDirective({ component: PlayerBoardsComponent, props: mixinCommonProps()});
            }
            players.push(playerHolder);
        }

        if (!options.skipPlay) {
            play();
        } else {
            options.skipPlay = false;
        }
    };

    actions = actionDocs.sort(function (a, b) {
        return Date.parse(a.created) - Date.parse(b.created);
    });

    initialize();
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