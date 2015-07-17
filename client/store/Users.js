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
        getUsers: function() {
            return this.users || [];
        },
        getLoggedInUser: function() {
            return this.loggedInUser || null;
        }
    },

    initialize: function () {
        this.users = [];
        this.loggedInUser = null;
        this.loading = false;
        this.errors = [];

        this.loadInitial();
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
    },

    loadInitial: function() {
        this.loggedInUser = DungeonLords ? DungeonLords.loggedInUser : null;
    }
}));