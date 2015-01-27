'use strict';

var api = require('../api'),
    router = require('../router');

module.exports = {
    load: function () {
        this.dispatch('USERS');

        api.Users.get().then(function(response) {
            this.dispatch('USERS_SUCCESS', response);
        }.bind(this), function(err){
            this.dispatch('USERS_FAILURE', err);
        }.bind(this));
    },

    start: function(data) {
        this.dispatch('NEW_GAME');

        if (data.player3 === -3){
            delete data.player3;
        }

        if (data.player4 === -4) {
            delete data.player4;
        }

        api.Games.post(data).then(function(response) {
            this.dispatch('NEW_GAME_SUCCESS', response);
            if (response && response._id) {
                router.transitionTo('/game/' + response._id)
            }
        }.bind(this), function(err){
            this.dispatch('NEW_GAME_FAILURE', err);
        }.bind(this));
    }
};