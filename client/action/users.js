var api = require('../api');

module.exports = {
    getAll: function () {
        this.dispatch('USERS');

        api.Users.get().then(function(response) {
            this.dispatch('USERS_SUCCESS', response);
        }.bind(this), function(err){
            this.dispatch('USERS_FAILURE', err);
        }.bind(this));
    },

    getUsersForGame: function(gameId) {
        this.dispatch('USERS');

        api.Users.get(gameId, true).then(function (response) {
            this.dispatch('USERS_SUCCESS', response);
        }.bind(this), function(err){
            this.dispatch('USERS_FAILURE', err);
        }.bind(this));
    }
};