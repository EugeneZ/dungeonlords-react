var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store'),
    _ = require('lodash');

module.exports = fluxxor.createStore(protectedStore({
    public: {
        isLoading: function () {
            return !!this.loading;
        },
        getErrors: function () {
            return this.errors;
        },
        getMyGames: function(){
            return this.games;
        }
    },

    initialize: function () {
        this.loading = false;
        this.errors = [];
        this.games = DungeonLords.loggedInUser.games;
    },

    bindActions: function () {
        return {
            NEW_GAME: function(creationStub){
                this.loading = true;
                this.games.push(creationStub);
                this.emit('change');
            },

            NEW_GAME_SUCCESS: function(data){
                this.loading = false;
                this.errors = [];
                var gameIndex = this.games.indexOf(data.creationStub);
                if (gameIndex !== -1) {
                    this.games[gameIndex] = data.doc;
                }
                this.emit('change');
            },

            NEW_GAME_FAILURE: function(creationStub){
                this.loading = false;
                this.errors.push('Unable to create game');
                var gameIndex = this.games.indexOf(creationStub);
                if (gameIndex !== -1) {
                    this.games.splice(this.games.indexOf, 1);
                }
                this.emit('change');
            }
        };
    }
}));