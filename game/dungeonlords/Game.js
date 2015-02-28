var _ = require('lodash');

var Game = function(gameDoc, actionDocs, uid){
    this.doc = gameDoc;
    this.actions = actionDocs.sort(function(a, b){ return Date.parse(a.created) - Date.parse(b.created); });
    this.frame = 0;
    this.uid = uid || 'Server'; // pass the current player's uid. If nothing is passed, means it's the server

    this.initialize();
};

Game.Phase = {
    NEW_ROUND: 1,
    ORDERS: 2,
    PRODUCTION: 3,
    EVENT: 4,
    ADVENTURERS: 5,
    END_OF_ROUND: 6,
    COMBAT_ROUND_ONE: 7,
    COMBAT_ROUND_TWO: 8,
    COMBAT_ROUND_THREE: 9,
    COMBAT_ROUND_FOUR: 10
};

Game.Season = {
    WINTER: 1,
    SPRING: 2,
    SUMMER: 3,
    FALL  : 4,
    COMBAT: 5
};

Game.Room = {
    TUNNEL: 1,
    CONQUERED_TUNNEL: 2,
    CONQUERED_ROOM: 3,
    CHICKEN_COOP: 4,
    MUSHROOM_BED: 5,
    SOUVENIR_SHOP: 6,
    MINT: 7,
    WORKSHOP: 8,
    TOOL_SHED: 9,
    PRINTING_PRESS: 10,
    MAGIC_ROOM: 11,
    TRAINING_ROOM: 12,
    DARK_ROOM: 13,
    LABYRINTH: 14,
    ANTIMAGIC_ROOM: 15,
    CAFETERIA: 16,
    CHAPEL: 17,
    PANDEMONIUM: 18,
    HALL_OF_FAME: 19
};

Game.YearOneRooms = [
    Game.Room.CHICKEN_COOP,
    Game.Room.MUSHROOM_BED,
    Game.Room.SOUVENIR_SHOP,
    Game.Room.MINT,
    Game.Room.WORKSHOP,
    Game.Room.TOOL_SHED,
    Game.Room.PRINTING_PRESS,
    Game.Room.MAGIC_ROOM
];

Game.YearTwoRooms = [
    Game.Room.TRAINING_ROOM,
    Game.Room.DARK_ROOM,
    Game.Room.LABYRINTH,
    Game.Room.ANTIMAGIC_ROOM,
    Game.Room.CAFETERIA,
    Game.Room.CHAPEL,
    Game.Room.PANDEMONIUM,
    Game.Room.HALL_OF_FAME
];

Game.Monster = {
    GOBLIN: 1,
    SLIME: 2,
    GHOST: 3,
    TROLL: 4,
    WITCH: 5,
    VAMPIRE: 6,
    GOLEM: 7,
    DRAGON: 8,
    DEMON: 9
};

Game.YearOneMonsters = [
    Game.Monster.GOBLIN,
    Game.Monster.GOBLIN,
    Game.Monster.SLIME,
    Game.Monster.SLIME,
    Game.Monster.GHOST,
    Game.Monster.GHOST,
    Game.Monster.TROLL,
    Game.Monster.TROLL,
    Game.Monster.WITCH,
    Game.Monster.WITCH,
    Game.Monster.VAMPIRE,
    Game.Monster.VAMPIRE
];

Game.YearTwoMonsters = [
    Game.Monster.GOBLIN,
    Game.Monster.SLIME,
    Game.Monster.GHOST,
    Game.Monster.TROLL,
    Game.Monster.WITCH,
    Game.Monster.VAMPIRE,
    Game.Monster.GOLEM,
    Game.Monster.GOLEM,
    Game.Monster.DRAGON,
    Game.Monster.DRAGON,
    Game.Monster.DEMON,
    Game.Monster.DEMON
];

Game.Adventurer = {
    FIGHTER1: 1,
    FIGHTER2: 2,
    FIGHTER3: 3,
    FIGHTER4: 4,
    THIEF1: 5,
    THIEF2: 6,
    THIEF3: 7,
    THIEF4: 8,
    CLERIC1: 9,
    CLERIC2: 10,
    CLERIC3: 11,
    CLERIC4: 12,
    WIZARD1: 13,
    WIZARD2: 14,
    WIZARD3: 15,
    WIZARD4: 16,
    FIGHTER5: 17,
    FIGHTER6: 18,
    FIGHTER7: 19,
    FIGHTER8: 20,
    THIEF5: 21,
    THIEF6: 22,
    THIEF7: 23,
    THIEF8: 24,
    CLERIC5: 25,
    CLERIC6: 26,
    CLERIC7: 27,
    CLERIC8: 28,
    WIZARD5: 29,
    WIZARD6: 30,
    WIZARD7: 31,
    WIZARD8: 32
};

Game.YearOneAdventurers = [
    Game.Adventurer.FIGHTER1,
    Game.Adventurer.FIGHTER2,
    Game.Adventurer.FIGHTER3,
    Game.Adventurer.FIGHTER4,
    Game.Adventurer.THIEF1,
    Game.Adventurer.THIEF2,
    Game.Adventurer.THIEF3,
    Game.Adventurer.THIEF4,
    Game.Adventurer.CLERIC1,
    Game.Adventurer.CLERIC2,
    Game.Adventurer.CLERIC3,
    Game.Adventurer.CLERIC4,
    Game.Adventurer.WIZARD1,
    Game.Adventurer.WIZARD2,
    Game.Adventurer.WIZARD3,
    Game.Adventurer.WIZARD4
];

Game.YearTwoAdventurers = [
    Game.Adventurer.FIGHTER5,
    Game.Adventurer.FIGHTER6,
    Game.Adventurer.FIGHTER7,
    Game.Adventurer.FIGHTER8,
    Game.Adventurer.THIEF5,
    Game.Adventurer.THIEF6,
    Game.Adventurer.THIEF7,
    Game.Adventurer.THIEF8,
    Game.Adventurer.CLERIC5,
    Game.Adventurer.CLERIC6,
    Game.Adventurer.CLERIC7,
    Game.Adventurer.CLERIC8,
    Game.Adventurer.WIZARD5,
    Game.Adventurer.WIZARD6,
    Game.Adventurer.WIZARD7,
    Game.Adventurer.WIZARD8
];

Game.Move = {
    WAITING_FOR_SERVER: 1,
    WAITING_FOR_OTHERS: 2,
    SELECT_INITIAL_ORDERS: 3,   // Choose your starting orders
    SELECT_ORDERS: 4,           // Choose your secret orders!
    CONFIRM_ACTION: 5,          // For non-interactive actions, a confirmation that you want to take it.
    SELECT_TRAPS: 6,            // During year 2 you draw an extra trap but must discard one of those 2 or another you own
    SELECT_IMPS: 7,             // For the tunnel/gold actions, how many imps do you want to commit? Don't forget foreman if you need one
    SELECT_TUNNELS: 8,          // Where do you want to dig tunnels? No 2x2s
    SELECT_MONSTER: 9,          // When buying monsters, which one? You must be able to afford it
    SELECT_ROOM: 10,            // When buying rooms, which one and where do you place it? You need a legal spot before you can buy.
    SELECT_PRODUCTION: 11,      // Which rooms do you want to produce in?
    SELECT_TAKE_BACK: 12,       // if you have a minion 'hold' an order because you chose not to use it or couldn't, this is where you choose whether to take it back
    SELECT_PAYDAY: 13,          // For each monster you can afford to pay, do you want to? Lose monster and gain evil if not.
    SELECT_TAXES: 14,           // How much tax do you want to pay? (Dead letter per unpaid)
    SELECT_COMBAT_PLANNING: 15, // Planning phase of combat
    SELECT_COMBAT: 16,          // Decisions made after revealing the combat card for that round (your traps/monster choices from planning are committed now)
    EXECUTE_ORDERS: 17,
    SELECT_ADVENTURER: 18,
    ASSIGN_PLAYER_ORDER: 19,
    ASSIGN_INITIAL_ORDERS: 20
};

Game.Move._keyOf = _.invert(Game.Move);

Game.prototype.initialize = function(){
    this.logArr = [];

    // Boards
    this.phaseTrack = { season: 0, phase: 0, year: 0};
    this.monsters = [];
    this.discardedMonsters = [];
    this.rooms = [];
    this.discardedRooms = [];
    this.adventurers = [];
    this.dummyOrders = [];
    this.events = [null,null,null];
    this.serverDone = null;
    this.doneRandomizingPlayerOrder = false;
    this.doneAssigningFirstCards = false;

    // Player boards
    this.players = _.compact(this.doc.players).map(function(player, i) {
        return new Player(player);
    }.bind(this));

    // Easy lookup of players by id
    this.lookupPlayer = _.indexBy(this.players, 'id');

    // Easy iteration over boards
    this.eachPlayer   = this.players.forEach.bind(this.players);

    this.log('A game of Dungeon Lords has begun. ' + this.players.length + ' players have joined. They each receive 3 gold, food, imps, and tunnels. Good luck!');
    this.run();
};

// Executes all the pending server actions
Game.prototype.run = function(){
    for (; this.frame < this.actions.length; this.frame++) {
        this.runMove(this.actions[this.frame]);
    }
    this._next();
};

// Figures out what everyone has to do next
Game.prototype._next = function(){
    var everyPlayerIsDone;

    // By default, everyone is waiting. The rest of the code determines if this is incorrect
    var next = {
        forPlayer: { Server: Game.Move.WAITING_FOR_OTHERS }
    };
    this.eachPlayer(function(player){
        next.forPlayer[player.id] = Game.Move.WAITING_FOR_OTHERS;
    });

    if (this.phaseTrack.year === 0) {

        if (this.nextForGameStart(next)) {
            return;
        }

    } else if (this.phaseTrack.phase === Game.Phase.NEW_ROUND) {

        if (this.monsters.length < 3) {
            next.forPlayer.Server = Game.Move.SELECT_MONSTER;
        } else if (this.rooms.length < 2) {
            next.forPlayer.Server = Game.Move.SELECT_ROOM;
        } else if (this.adventurers.length < this._numberOfAdventurers()) {
            next.forPlayer.Server = Game.Move.SELECT_ADVENTURER;
        //} else if (this.phaseTrack.season !== Game.Season.FALL && this.events[this.phaseTrack.season-1]) {
            // TODO: Flip event tile, show card if neccessary
        } else {
            return this._nextPhase();
        }

    } else if (this.phaseTrack.phase === Game.Phase.ORDERS) {

        everyPlayerIsDone = _.every(this.players, function(player){ return player.orders.length === 3; });

        if (everyPlayerIsDone && this.serverDone) {
            return this._nextPhase();
        } else if (everyPlayerIsDone) {
            next.forPlayer.Server = Game.Move.EXECUTE_ORDERS;
        } else {
            this.eachPlayer(function(player) {
                if (player.orders.length !== 3) {
                    next.forPlayer[player.id] = Game.Move.SELECT_ORDERS;
                }
            });
        }

    } else if (this.phaseTrack.phase === Game.Phase.PRODUCTION) {

    } else {
        throw new Error('Something went wrong');
    }

    // If the server is supposed to do something, let the players know
    if (next.forPlayer.Server !== Game.Move.WAITING_FOR_OTHERS){
        this.eachPlayer(function(player){
            next.forPlayer[player.id] = Game.Move.WAITING_FOR_SERVER;
        });
    }
    this.next = next;
};

/**
 * Returns true if it wants the calling function to return early.
 */
Game.prototype.nextForGameStart = function(next){
    if (!this.doneRandomizingPlayerOrder) {
        next.forPlayer.Server = Game.Move.ASSIGN_PLAYER_ORDER;
        return;
    } else if (!this.doneAssigningFirstCards) {
        next.forPlayer.Server = Game.Move.ASSIGN_INITIAL_ORDERS;
        return;
    }

    var everyPlayerIsDone = _.every(this.players, function (player) {
        return player.unusableOrders.length === 2;
    });

    if (everyPlayerIsDone && this.serverDone) {
        return this._nextPhase();
    } else if (everyPlayerIsDone) {
        next.forPlayer.Server = Game.Move.EXECUTE_ORDERS;
    } else {
        this.eachPlayer(function(player) {
            if (!player.unusableOrders.length) {
                next.forPlayer[player.id] = Game.Move.SELECT_INITIAL_ORDERS;
            }
        });
    }
    //if (this.lookupPlayer[uid].ordersPicked) {
    //    return { move: Game.Move.WAITING_FOR_OTHERS };
    //} else {
    //    return {
    //        move: Game.Move.SELECT_INITIAL_ORDERS,
    //        value: function(){
    //            return this.lookupPlayer[user._id].initial.filter(function(order){ return order !== this.state.active });
    //        }.bind(this),
    //        action: Actions.ORDERS_PICKED,
    //        validate: function(value){
    //            value.forEach(function(order){
    //                if (this.lookupPlayer[useer._id].initial.indexOf(order) === -1) {
    //                    throw new Error('Illegal move');
    //                }
    //            }.bind(this));
    //            return value;
    //        }.bind(this)
    //    };
    //}
};

Game.prototype._nextPhase = function() {
    if (this.phaseTrack.year === 0 || this.phaseTrack.phase >= Game.Phase.COMBAT_ROUND_FOUR) {
        this.phaseTrack.year += 1;
        this.phaseTrack.phase = Game.Phase.NEW_ROUND;
        this.phaseTrack.season = Game.Season.WINTER;
    } else if (this.phaseTrack.phase === Game.Phase.END_OF_ROUND) {
        this.phaseTrack.season += 1;
        this.phaseTrack.phase += 1;
    } else {
        this.phaseTrack.phase += 1;
    }

    if (this.year > 2) {
        this.log('The game has ended!');
    } else {
        var phaseWord = _.startCase(_.findKey(Game.Phase, this.phaseTrack.phase));
        var seasonWord = _.startCase(_.findKey(Game.Season, this.phaseTrack.season));
        var yearWord = this.phaseTrack.year === 1 ? 'One' : 'Two';
        this.log('It is time for the ' + phaseWord + ' phase during ' + seasonWord + ' in Year ' + yearWord + '.');
    }

    this._next();
    return true; // This explicit true short circuits logic
};

Game.prototype._numberOfAdventurers = function() {
    switch (this.phaseTrack.season) {
        case Game.Season.WINTER:
            return this.players.length === 4 ? 4 : 3;
        case Game.Season.SPRING:
            return this.players.length === 4 ? 8 : 6;
        case Game.Season.SUMMER:
            return this.players.length === 4 ? 8 : 6;
        default:
            return 0;
    }
};

Game.prototype.dummyOrderResolver = function(){
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

Game.prototype.orderResolver = function(){
    var board = this.dummyOrderResolver();

    var playerOrder = _.pluck(this.players, 'id').sort();

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
};

Game.prototype.log = function(msg){
    this.logArr.push({
        message: msg
    });
};

Game.prototype.getLog = function(){
    return this.logArr;
};

/**
 * Checks whether the value is a legal move for the current player.
 * @param value
 * @returns {*}
 */
Game.prototype.isLegal = function(value){
    var move = this.next.forPlayer[this.uid];
    return this._MoveHandlers[Game.Move._keyOf[move]].isLegal.call(this, value);
};

/**
 * Gets the value that should be recorded in the db for the current player.
 * @returns {*}
 */
Game.prototype.getValueForMove = function(){
    var move = this.next.forPlayer[this.uid];
    return this._MoveHandlers[Game.Move._keyOf[move]].getValue.call(this);
};

/**
 * Sets the value from either the server function for the server or the state representation for the active player.
 * @param value
 */
Game.prototype.setValueForMove = function(value){
    var move = this.next.forPlayer[this.uid];
    this._MoveHandlers[Game.Move._keyOf[move]].setValue.call(this, value);
};

/**
 * Returns the value that should be used for the server's move
 * @returns {*}
 */
Game.prototype.getServerMoveValue = function(){
    var move = this.next.forPlayer.Server;
    return this._MoveHandlers[Game.Move._keyOf[move]].server.call(this);
};

/**
 * Runs the logic for a recorded move
 * @param action
 */
Game.prototype.runMove = function(action){
    this._MoveHandlers[Game.Move._keyOf[action.action]].run.call(this, action);
};

/**
 * Determines whether players other than the one whose action it is can see the value
 * @param action
 * @returns {Function|boolean}
 */
Game.prototype.isHidden = function(action){
    return this._MoveHandlers[Game.Move._keyOf[action.action]].isHidden || false;
};

Game.prototype._MoveHandlers = {

    ASSIGN_PLAYER_ORDER: {
        server: function() {
            return this.players.map(function(player){
                return { uid: player.id, value: _.random(1, 100000) };
            });
        },
        run: function(action) {
            action.value.forEach(function(sub){
                this.lookupPlayer[sub.uid].order = sub.value;
            }.bind(this));
            this.doneRandomizingPlayerOrder = true;

            var orderWords = _(this.lookupPlayer)
                .map(function(p){ return { name: p.name, order: p.order }; })
                .sort(function(a,b){ return a.order > b.order })
                .map(function(p){ return p.name})
                .value()
                .join(', ');

            this.log('Player order has been randomly assigned like this: ' + orderWords);
        }
    },

    ASSIGN_INITIAL_ORDERS: {
        isHidden: true,
        server: function() {
            return this.players.map(function(player){
                return { uid: player.id, value: randomUniqueArray(3, 1, 8) };
            }.bind(this));
        },
        run: function(action) {
            action.value.forEach(function(sub){
                this.lookupPlayer[sub.uid].initial = sub.value;
            }.bind(this));
            this.doneAssigningFirstCards = true;

            this.log('The initial orders have been shown.');
        }
    },

    SELECT_INITIAL_ORDERS: {
        isHidden: true,
        isLegal: function(value){
            if (value.length !== 2) {
                throw new Error('Two of the initial three orders must be held.');
            }

            value.forEach(function(order){
                if (this.lookupPlayer[this.uid].initial.indexOf(order) === -1) {
                    throw new Error('Illegal move');
                }
            }.bind(this));

            return true;
        },
        getValue: function(){
            return this.lookupPlayer[this.uid].unusableOrders;
        },
        setValue: function(value){
            // user picks the card they want to keep, but we want to record their inaccessible cards, so we need to invert it
            this.lookupPlayer[this.uid].unusableOrders = _.pull(this.lookupPlayer[this.uid].initial, value);
        },
        server: function(){
            throw new Error('Server should never make this move')
        },
        run: function(action){
            this.lookupPlayer[action.user].unusableOrders = action.value;
            this.log(this.lookupPlayer[action.user].name + ' picked their initial orders.');
        }
    },

    EXECUTE_ORDERS: {
        server: function(){
             return this.players.map(function(player){
                 return { uid: player.id, value: player.unusableOrders };
             }.bind(this));
        },
        run: function(action){
            action.value.forEach(function(sub){
                this.lookupPlayer[sub.uid].unusableOrders = sub.value;
            }.bind(this));
            this.serverDone = true;
            this.log('The first set of unusable orders have been revealed.');
        }
    },

    SELECT_MONSTER: {
        isLegal: function() { return true },
        server: function(){
            return randomUniqueArray(3, 0, 12 - this.discardedMonsters.length - 1);
        },
        run: function(action){
            this.monsters = action.value;
            this.log('Monsters have walked into the inn.');
        }
    },

    SELECT_ROOM: {
        isLegal: function() { return true },
        server: function(){
            return randomUniqueArray(3, 0, 8 - this.discardedRooms.length - 1);
        },
        run: function(action){
            this.rooms = action.value;
            this.log('Rooms are available for rent.');
        }
    },

    SELECT_ADVENTURER: {
        server: function(){
            var numberOfAdventurers = this.players.length === 4 ? 4 : 3;
            return randomUniqueArray(numberOfAdventurers, 0, 16 - this.adventurers.length - 1);
        },
        run: function(action){
            this.adventurers = this.adventurers.concat(action.value);
            this.log('Some adventurers are getting antsy...');
        }
    }
};

var Player = function(doc) {
    if (!doc || !doc._id) {
        throw new Error('Player needs an id and a game reference');
    }

    this.id = doc._id;
    this.doc = doc;

    this.initialize();
};

Player.prototype.initialize = function(){
    this.name = this.doc.name || this.doc._id; // TODO: get the correct name

    this.gold = 3;
    this.imps = 3;
    this.food = 3;

    // Turn order. Higher is better!
    this.order = 0;

    // Evilmeter. Higher means more evil.
    this.rep = 0;

    // A 2d array indicating the contents of your dungeon layout. Access as [column][row]
    this.dungeon = [[0,0,0,0],[0,0,0,0],[Game.Room.TUNNEL,Game.Room.TUNNEL,Game.Room.TUNNEL,0],[0,0,0,0],[0,0,0,0]];

    // The collection of your prison, used for points/trophies at the end
    this.prison = [];

    // The line outside of your door. Index 0 represents the space closest to the door.
    this.adventurers = [];

    // PRIVATE CONTENTS, but the length is public. Private traps are added as 0's.
    this.traps = [];

    // How many -3 point marks you have on your account. These are the red cubes in the upper right of the board
    this.deadLetters = [];

    // Ids of monsters you have
    this.monsters = [];

    // Starting hand. You must pick one to keep and two to put in unusable orders
    this.initial = null;

    // SECRET. The orders you have selected. Secret until they are revealed
    this.orders = [];

    // The orders you cannot choose. Public knowledge,
    this.unusableOrders = [];

    // The orders you picked but couldn't or didn't want to use.
    this.didnotuse = [];

    this.ordersPicked = null;
};

Game.Player = Player;

module.exports = Game;

function randomUniqueArray(length, min, max) {
    var rands = [], tries = 0;
    do {
        if (tries++ > 100) {
            throw new Error('Had a problem generating unique random numbers');
        }
        rands = rands.push(_.random(min, max)) && _.uniq(rands);
    } while (rands.length !== length);
    return rands;
}