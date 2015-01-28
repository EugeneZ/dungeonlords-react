'use strict';

var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store'),
    _ = require('lodash'),
    domUtils = require('../util/domUtils'),
    io = require('../socket');

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
        getLog: function() {
            return this.actions.map(function(action){
                switch(action.action){
                    case 1:
                        return 'Player ' + action.user + ' rolled a ' + action.value + ' for turn order.';
                    case 2:
                        return 'Moving on to phase #' + action.value;
                    case 3:
                        return 'Player ' + action.user + ' got ' + action.value + ' gold';
                    case 4:
                        return 'Player ' + action.user + ' got ' + action.value + ' imps';
                    case 5:
                        return 'Player ' + action.user + ' got ' + action.value + ' food';
                    case 6:
                        return 'Player ' + action.user + ' placed a tunnel in location: ' + action.value;
                    case 15:
                        return 'Player ' + action.user + ' is deciding which orders to start the game with';
                    default:
                        return 'Mysterious log message.';
                }
            });
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

        this.loadInitial();
    },

    bindActions: function () {
        return {
            NEW_GAME_SUCCESS: this.newGame,
            NEW_GAME_FAILURE: this.newGameFailed,
            GAME_SUCCESS: this.newGame,
            GAME_FAILURE: this.newGameFailed
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
        if (this.game) {
            io.emit('JoinGame', { game: this.game._id });
        }
    },

    loadActions: function(actions) {
        this.actions = actions;
    }
}));