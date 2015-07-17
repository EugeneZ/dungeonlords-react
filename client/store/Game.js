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
        getGame: function() {
            return this.game || null;
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
        }
    },

    initialize: function () {
        this.game = null;
        this.actions = [];
        this.loading = false;
        this.errors = [];

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

    loadActions: function(actionOrActions) {
        var user = this.flux.store('Users').getLoggedInUser();
        if (actionOrActions.length) {
            this.actions = actionOrActions;
        } else {
            this.actions.push(actionOrActions);
        }
        this.logic = new Game(this.game, this.actions, user.id); // TODO: making a new game every time can be expensive
    },

    makeMove: function() {
        if (this.move === Game.Move.SELECT_INITIAL_ORDERS) {
            this.logic.setValueForMove(this.order);
        } else if (this.move === Game.Move.SELECT_ORDERS) {
            this.logic.setValueForMove(_.compact(this.orders.concat(this.selectedDummyOrder)));
        }

        io.emit('PostGameAction', {
            game: this.game._id,
            value: this.logic.getValueForMove()
        });

        this.move = Game.Move.WAITING_FOR_OTHERS;
        this.emit('change');
    }
}));