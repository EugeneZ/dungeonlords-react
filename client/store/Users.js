'use strict';

var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store');

module.exports = fluxxor.createStore(protectedStore({
    public: {
        isLoading: function () {
            return !!this.loading;
        },
        getErrors: function () {
            return this.errors;
        },
        getUsers: function() {
            return this.users;
        }
    },

    initialize: function () {
        this.users = [];
        this.loading = false;
        this.errors = [];
    },

    bindActions: function () {
        return {
            INITIAL_USERS: this.loadUsers,
            USERS_SUCCESS: this.loadUsers,
            USERS_FAILURE: function(err){
                this.loading = false;
                this.errors = [].push(err);
                this.emit('change');
            }
        };
    },

    loadUsers: function(users) {
        this.loading = false;
        this.errors = [];
        this.users = users;
        this.emit('change');
    }
}));