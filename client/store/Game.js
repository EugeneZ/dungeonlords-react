'use strict';

var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store'),
    domUtils = require('../util/domUtils');

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
        }
    },

    initialize: function () {
        this.game = null;
        this.loading = false;
        this.errors = [];

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
    }
}));