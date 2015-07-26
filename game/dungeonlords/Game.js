var _ = require('lodash'),
    Action = require('./Action'),
    Player = require('./Player'),
    Area   = require('./Area'),
    MathUtil = require('../MathUtil');

    /*
    These are React components that we don't want to load on the server side because they are used for player display. We could use a function to save us some boilerplate
    code, but that would defeat browserify's ability to inline these components. So we don't do that.
    */
var PlayerBoardsComponent  = typeof window !== 'undefined' ? require('./component/PlayerBoards') : null,
    PickOrdersComponent    = typeof window !== 'undefined' ? require('./component/PickOrders') : null,
    ConfirmOrderComponent = typeof window !== 'undefined' ? require('./component/ConfirmOrder') : null;

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
        playerOrder = [],
        round = 0,
        year = 1,
        dummyPlayer1Orders = [],
        dummyPlayer2Orders = [],
        tilesOnOffer;

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
        for (var i = options.all ? 0 : actionIndex; i < actions.length; i++) {
            if (actions[i].action === type) {
                filteredActions.push(Action[type].deserialize(actions[i]));
                if (!options.all) {
                    actionIndex = i + 1;
                }
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
        return _.merge({
            players: players,
            currentPlayer: thisPlayer,
            adventurers: tilesOnOffer && tilesOnOffer.adventurers,
            monsters: tilesOnOffer && tilesOnOffer.monsters,
            rooms: tilesOnOffer && tilesOnOffer.rooms,
            event: tilesOnOffer && tilesOnOffer.event

        }, props || {});
    };

    /**
     * Assigns player order and shuffles/deals initial orders (and initially held orders for dummy players)
     */
    var pickStartingPlayerAndInitialOrders = function () {
        log('The Ministry of Dungeons welcomes you to a trial for your dungeon lord license. Have fun!');

        // Determine player order
        var playerOrderAction = getActions(Action.Type.ASSIGN_PLAYER_ORDER, {one: true});
        if (!playerOrderAction) {
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
            playerOrderAction.map(function(playerId){
                var player = _.find(players, function(player){ return player.getId() === playerId; });
                playerOrder.push(player);
                return player.getName();
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
        if (players.length === 3) {
            dummyPlayer1Orders = initialOrders.getHeldDummyOrders();
        } else if (players.length === 2) {
            dummyPlayer1Orders = initialOrders.getHeldDummyOrders(players[0].getId());
            dummyPlayer2Orders = initialOrders.getHeldDummyOrders(players[1].getId());
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
        var revealedData = getActions(Action.Type.REVEAL_NEW_ROUND_DATA, { all: true });
        if (revealedData.length < round + (year - 1 ? 0 : 4)) {
            var newRevealedData = Action[Action.Type.REVEAL_NEW_ROUND_DATA].create(),
                usedMonsters = [],
                usedRooms = [],
                usedAdventurers = [],
                usedEvents = [];

            revealedData.forEach(function(data){
                usedMonsters = usedMonsters.concat(data.monsters);
                usedRooms = usedRooms.concat(data.rooms);
                if (data.adventurers) {
                    usedAdventurers = usedAdventurers.concat(data.adventurers);
                }
                if (data.event) {
                    usedEvents.push(data.event);
                }
            });

            var newMonsters = MathUtil.pullFromDeck(3, 1, 12, usedMonsters);
            newRevealedData.newMonsters(newMonsters[0], newMonsters[1], newMonsters[3]);

            var newRooms = MathUtil.pullFromDeck(2, 1, 8, usedRooms);
            newRevealedData.newRooms(newRooms[0], newRooms[1]);

            if (round != 4) {
                var newAdventurers = MathUtil.pullFromDeck(4, 1, 16, usedAdventurers);
                newRevealedData.newAdventurers(newAdventurers[0], newAdventurers[1], newAdventurers[2], players.length === 4 ? newAdventurers[3] : null);

                var newEvent = MathUtil.pullFromDeck(1, 1, 3, usedEvents);
                newRevealedData.newEvent(newEvent[0]);
            }

            makeServerMove(newRevealedData);
            return false;
        } else {
            tilesOnOffer = revealedData[revealedData.length - 1];
        }

        log('Round ' + round + ' begins! The Ministry has made new choices available on the board.');
        return true;
    };

    var ordersPhase = function(){
        if (players.length < 4) {

            var assignedDummyOrders = getActions(Action.Type.ASSIGN_DUMMY_ORDERS, { one: true });
            if (!assignedDummyOrders) {
                var newDummyOrders = Action[Action.Type.ASSIGN_DUMMY_ORDERS].create();
                if (players.length === 3) {
                    newDummyOrders.addDummyOrders(null, MathUtil.pullFromDeck(3, 1, 8, dummyPlayer1Orders));
                } else {
                    players.forEach(function(player, i){
                        newDummyOrders.addDummyOrders(player.getId(), MathUtil.pullFromDeck(2, 1, 8, i ? dummyPlayer1Orders : dummyPlayer2Orders));
                    });
                }
                makeServerMove(newDummyOrders);
                return false;
            }

            if (players.length === 3) {
                dummyPlayer1Orders = assignedDummyOrders.getHeldDummyOrders();
            } else {
                players.forEach(function(player, i){
                    var dummyOrders = assignedDummyOrders.getHeldDummyOrders(player.getId());
                    i ? dummyPlayer1Orders = dummyOrders : dummyPlayer2Orders = dummyOrders;
                });
            }

            log('Randomly selected dummy orders have been selected.');
        }

        var selectOrders = getActions(Action.Type.SELECT_ORDERS);
        if (selectOrders.length !== players.length) {
            players.forEach(function(player){
                if (_.find(selectOrders, { id: player.getId() })) {
                    player.setWaiting();
                } else {
                    player.setDirective({
                        component: PickOrdersComponent,
                        props: mixinCommonProps({
                            orders: _.difference(MathUtil.getFullDeck(1,8), player.getHeldOrders()),
                            onSubmit: function(orders) {
                                makePlayerMove(Action[Action.Type.SELECT_ORDERS].create(thisPlayer.getId(), orders));
                            }
                        })
                    });
                }
            }.bind(this));
            return false;
        }

        var revealOrders = getActions(Action.Type.REVEAL_ORDERS, { one: true });
        if (!revealOrders) {
            revealOrders = Action[Action.Type.REVEAL_ORDERS].create();
            players.forEach(function(player){
                var orders = _.find(selectOrders, { id: player.getId() });
                revealOrders.addPlayerOrders(orders.id, orders.orders);
                if (players.length === 2) {
                    revealOrders.addPlayerDummyOrder(orders.id, orders.dummyOrder);
                }
            });
            makeServerMove(revealOrders);
            return false;
        }

        players.forEach(function(player, i){
            player.setOrders(revealOrders.getPlayerOrders(player.getId()));
            if (players.length === 2) {
                var dummyOrder = revealOrders.getPlayerDummyOrder(player.getId());
                i ? dummyPlayer1Orders.push(dummyOrder) : dummyPlayer2Orders.push(dummyOrder);
            }
        });

        // Place minions -- the areas is an array if length 8, one for each area that a minion can be sent to. The indexes match the order cards if you subtract 1 from the order.
        // Each area is also an array with length 4, in placement order, with the value being null (nothing), playerId (the player took that order), or boolean true (dummy holding this spot).
        // If the fourth placement is filled with a playerId, that indicates there was not enough room for this minion and he gets sent back to the player board.
        var areas = [[],[],[],[],[],[],[],[]];
        var nextFreeArea = function(order, dummy){
            if (dummy) {
                return areas[order - 1][1] ? 2 : 1;
            }
            if (!areas[order - 1][0]) {
                return 0;
            } else if (!areas[order - 1][1]) {
                return 1;
            } else if (!areas[order - 1][2]) {
                return 2;
            } else {
                return 3;
            }
        };
        if (players.length < 4) {
            areas[dummyPlayer1Orders[0] - 1][1] = true;
            areas[dummyPlayer1Orders[1] - 1][1] = true;
            if (players.length === 2) {
                areas[dummyPlayer1Orders[2] - 1][0] = true;
            } else {
                areas[dummyPlayer1Orders[2] - 1][1] = true;
            }
        }
        if (players.length === 2) {
            areas[dummyPlayer2Orders[0] - 1][nextFreeArea(dummyPlayer2Orders[0], true)] = true;
            areas[dummyPlayer2Orders[1] - 1][nextFreeArea(dummyPlayer2Orders[1], true)] = true;
            areas[dummyPlayer2Orders[2] - 1][nextFreeArea(dummyPlayer2Orders[2])] = true;
        }
        for(var i = 0; i < 3; i++) {
            playerOrder.forEach(function (player) {
                var order = player.getOrders()[i];
                areas[order - 1][nextFreeArea(order)] = player.getId();
            });
        }

        // Execute orders based on placed minions
        var confirmedActions = _.filter(getActions(Action.Type.CONFIRM_ACTION, { all: true }), { year: year, round: round }),
            confirmedAction,
            playersWithActionsToTake = [];
        for (var area = 0; area < 8; area++) {
            for (var placement = 0; placement < 4; placement++) {
                var playerId = areas[area][placement];
                if (playerId && playerId !== true && playersWithActionsToTake.indexOf(playerId) === -1) {
                    confirmedAction = _.find(confirmedActions, { id: playerId, order: area + 1 });
                    if (!executeOrder(playerId, confirmedAction, area + 1, placement)) {
                        playersWithActionsToTake.push(playerId);
                    }
                }
            }
        }

        if (playersWithActionsToTake.length) {
            players.forEach(function (player) {
                if (playersWithActionsToTake.indexOf(player.getId()) === -1) {
                    player.setWaiting();
                }
            });
            return false;
        }

        return true;
    };

    var executeOrder = function(playerId, confirmedAction, order, placement){
        var player = _.find(players, function(player){ return player.getId() === playerId });
        if (!confirmedAction) {
            if (!player.checkCost(Area[order][placement].input, tilesOnOffer)){
                makeServerMove(Action[Action.Type.CONFIRM_ACTION].create(playerId, year, round, order, false));
            } else {
                players.forEach(function (player) {
                    if (player.getId() === playerId) {
                        player.setDirective({
                            component: ConfirmOrderComponent,
                            props: mixinCommonProps({
                                order: order,
                                placement: placement
                            }),
                            onSubmit: function (value) {
                                makePlayerMove(Action[Action.Type.CONFIRM_ACTION].create(playerId, year, round, order, value));
                            }
                        });
                    }
                });
            }
            return false;
        } else if (confirmedAction.value) {
            var execute = Area[order][placement];
            if (confirmedAction.value.paid) {
                for (var medium in confirmedAction.value.paid) {
                    if (medium === 'gold') {
                        player.loseGold(execute.input[medium]);
                    } else if (medium === 'food') {
                        player.loseFood(execute.input[medium]);
                    } else if (medium === 'imps') {
                        player.useImps(execute.input[medium]);
                    } else if (medium === 'evil'){
                        player.gainEvil(execute.input[medium]);
                    }
                }
            }
        } else {
            player.setMinionHeld();
        }
        return true;
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
        playerOrder = [];
        round = 0;
        year = 1;
        dummyPlayer1Orders = [];
        dummyPlayer2Orders = [];

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

module.exports = Game;