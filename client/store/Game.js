'use strict';

var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store'),
    _ = require('lodash'),
    domUtils = require('../util/domUtils'),
    io = require('../socket'),
    Game = require('../../game/dungeonlords/Game'); // Loading a server component! Re-using logic core for server/clientside;

module.exports = fluxxor.createStore(protectedStore({
    public: {
        isLoading: function () {
            return !!this.loading;
        },
        getErrors: function () {
            return this.errors || [];
        },
        getGame: function() {
            return this.game || null;
        },
        getMove: function() {
            return this.move;
        },
        getLog: function() {
            if (!this.logic) {
                return [];
            } else {
                return this.logic.getLog();
            }
        },
        getLogic: function(){
            return this.logic || null;
        },
        getOrder: function(){
            return this.order || null;
        }
    },

    initialize: function () {
        this.game = null;
        this.actions = [];
        this.loading = false;
        this.errors = [];
        this.move = Game.Move.WAITING_FOR_SERVER;

        io.on('JoinGameSuccess', function(){
            io.emit('GetGameActions', { game: this.game._id });
        }.bind(this));

        io.on('GameActions', function(data){
            this.loadActions(data);
            this.emit('change');
        }.bind(this));

        io.on('GameAction', function(action){
            this.loadActions(action);
            this.emit('change');
        }.bind(this));

        this.loadInitial();
    },

    bindActions: function () {
        return {
            NEW_GAME_SUCCESS: this.newGame,
            NEW_GAME_FAILURE: this.newGameFailed,
            GAME_SUCCESS: this.newGame,
            GAME_FAILURE: this.newGameFailed,
            MAKE_MOVE: this.makeMove,
            UNDO: this.undo,
            ORDER: this.orderClicked
        };
    },

    newGame: function(game) {
        this.loading = false;
        this.errors = [];
        this.game = game;

        io.emit('JoinGame', { game: this.game._id });

        this.emit('change');
    },

    newGameFailed: function() {
        this.loading = false;
        this.errors = ['Couldn\'t create a new game'];
        this.game = null;
        this.emit('change');
    },

    loadInitial: function() {
        this.game = domUtils.getInitialData('game');
        this.user = domUtils.getInitialData('loggedInUser');
        if (this.game) {
            io.emit('JoinGame', { game: this.game._id });
        }
    },

    loadActions: function(actionOrActions) {
        if (actionOrActions.length) {
            this.actions = actionOrActions;
        } else {
            this.actions.push(actionOrActions);
        }
        this.logic = new Game(this.game, this.actions, this.user._id); // TODO: making a new game every time can be expensive
        this.move = this.logic.next.forPlayer[this.user._id];
        console.log(this.logic);
        console.log('Move: ', this.move);
    },

    makeMove: function() {
        this.logic.setValueForMove(this.order);

        io.emit('PostGameAction', {
            game: this.game._id,
            value: this.logic.getValueForMove()
        });

        this.move = Game.Move.WAITING_FOR_OTHERS;
        this.emit('change');
    },

    orderClicked: function(order) {
        this.order = order;
        this.emit('change');
    },

    undo: function() {
        this.order = null;
        this.emit('change');
    }
}));