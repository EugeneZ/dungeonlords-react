var _ = require('lodash'),
    Actions = require('./Actions'),
    Phases = require('./Phases'),
    Rooms = require('./Rooms');

var Game = function(gameDoc, actionDocs){
    this.doc = gameDoc;
    this.actions = actionDocs.sort(function(a, b){ return Date.parse(a.created) - Date.parse(b.created); });
    this.frame = 0;

    this.initialize();
    this.run();
};

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
    SELECT_COMBAT: 16           // Decisions made after revealing the combat card for that round (your traps/monster choices from planning are committed now)
};

Game.prototype.initialize = function(){

    // Boards
    this.phaseTrack = { season: 0, phase: 0, year: 0};
    this.monsters = [];
    this.rooms = [];
    this.dummyOrders = [];

    // Player boards
    this.players = _.compact(this.doc.players).map(function(player, i){
        return {
            id: player._id,

            gold: 0,
            imps: 0,
            food: 0,

            // Turn order. Higher is better!
            order: 0,

            // Evilmeter. Higher means more evil.
            rep: 0,

            // A 2d array indicating the contents of your dungeon layout. Access as [column][row]
            map: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],

            // The collection of your dungeon, used for points/trophies at the end
            dungeon: [],

            // The line outside of your door. Index 0 represents the space closest to the door.
            adventurers: [],

            // PRIVATE CONTENTS, but the length is public. Private traps are added as 0's.
            traps: [],

            // How many -3 point marks you have on your account. These are the red cubes in the upper right of the board
            deadLetters: [],

            // Ids of monsters you have
            monsters: [],

            // Starting hand. You must pick one to keep and two to put in unusable orders
            initial: null,

            // SECRET. The orders you have selected. Secret until they are revealed
            orders: [0,0,0],

            // The orders you cannot choose. Public knowledge,
            unusableOrders: [],

            // The orders you picked but couldn't or didn't want to use.
            didnotuse: []
        };
    }.bind(this));

    this.lookupPlayer = _.indexBy(this.players, 'id');
};

Game.prototype.run = function(){
    for (; this.frame < this.actions.length; this.frame++) {
        var a = this.actions[this.frame];
        this._ActionHandlers[Actions._keyOf[a.action]].call(this, a.user, a.value);
    }
};

Game.prototype.nextMove = function(uid){
    if (this.phaseTrack.year === 0) {
        if (!this.lookupPlayer[uid].initial || !this.lookupPlayer[uid].initial.length) {
            return Game.Move.WAITING_FOR_SERVER;
        } else {
            return Game.Move.SELECT_INITIAL_ORDERS;
        }
    } else if (this.phaseTrack.phase === Phases.ORDERS) {
        if (_.every(this.players, function(player){ return player.orders.length; })) {
            //
        } else {
            return Game.Move.SELECT_ORDERS;
        }
    } else if (this.phaseTrack.phase === Phases) {

    } else {
        return Game.Move.WAITING_FOR_SERVER;
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

Game.prototype._ActionHandlers = {
    ASSIGN_PLAYER_ORDER: function(uid, v){
        this.lookupPlayer[uid].order = v;
    },
    PHASE: function(){
        if (this.phaseTrack.year === 0) {
            this.phaseTrack.year = 1;
            this.phaseTrack.phase = Phases.NEW_ROUND;
        } else if (this.phaseTrack.phase === Phases.COMBAT_ROUND_FOUR) {
            this.phaseTrack.year = this.phaseTrack.year + 1;
            this.phaseTrack.phase = Phases.NEW_ROUND;
        } else if (this.phaseTrack.phase === Phases.END_OF_ROUND && this.phaseTrack.season === Phases._SEASON.FALL) {
            this.phaseTrack.phase = Phases.COMBAT_ROUND_ONE;
            this.phaseTrack.season = Phases._SEASON.COMBAT;
        } else if (this.phaseTrack.phase === Phases.END_OF_ROUND) {
            this.phaseTrack.season = this.phaseTrack.season + 1;
            this.phaseTrack.phase = Phases.NEW_ROUND;
        } else {
            this.phaseTrack.phase = this.phaseTrack.phase + 1;
        }
    },
    GOLD: function(uid, v){
        this.lookupPlayer[uid].gold += v;
    },
    IMPS: function(uid, v){
        this.lookupPlayer[uid].imps += v;
    },
    FOOD: function(uid, v){
        this.lookupPlayer[uid].food += v;
    },
    REP: function(uid, v){
        var p = this.lookupPlayer[uid];
        p.rep += v;
        if (p.rep > 10) {
            p.rep = 10;
        } else if (p.rep < -4) {
            p.rep = -4;
        }
    },
    ROOM: function(uid, v){
        this.lookupPlayer[uid].map[v.column][v.row] = v.id;
    },
    TRAP: function(uid, v){
        this.lookupPlayer[uid].traps.concat(v);
    },
    REVEAL_MONSTER: function(uid, v){
        this.monsters = v;
    },
    REVEAL_ROOM: function(uid, v){
        this.rooms = v;
    },
    ASSIGN_SECRET_ORDER: function(uid, v){
        this.lookupPlayer[uid].order = v;
    },
    PICK_INITIAL_ORDERS: function(uid, v){
        this.lookupPlayer[uid].initial = v;
    },
    SLOT_UNUSABLE_ORDER: function(uid, v){
        this.lookupPlayer[uid].unusableOrders.concat(v);
    },
    ASSIGN_DUMMY_MARKER: function(uid, v){
        this.dummyOrders = v;
    }
};

module.exports = Game;