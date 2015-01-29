'use strict';

var api = require('../api');

module.exports = {
    load: function (id) {
        var game = this.flux.store('Game').getGame();

        if (!game) {
            api.Games.get(id).then(function (response) {
                this.dispatch('GAME_SUCCESS', response);
            }.bind(this), function(err) {
                this.dispatch('GAME_FAILURE', err);
            });
        }
    },

    makeMove: function(state) {
        this.dispatch('MAKE_MOVE', state);
    }
};