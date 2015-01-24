'use strict';

var api = require('../api');

module.exports = {
    load: function () {
        this.dispatch('USERS');

        api.Users.get().then(function(response) {
            this.dispatch('USERS_SUCCESS', response);
        }.bind(this), function(err){
            this.dispatch('USERS_FAILURE', err);
        }.bind(this));
    }
};