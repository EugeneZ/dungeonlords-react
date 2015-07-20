var fluxxor = require('fluxxor'),
    protectedStore = require('fluxxor-protected-store'),
    _ = require('lodash'),
    io = require('../socket'),
    Game = require('../../game/dungeonlords/Game');

module.exports = fluxxor.createStore(protectedStore({
    public: {
        isLoading: function () {
            return !!this.loading;
        },
        getGame: function() {
            return this.game || null;
        },
        getLog: function() {
            if (!this.game) {
                return [];
            } else {
                return this.game.getLog();
            }
        }
    },

    initialize: function () {
        this.game = null;
        this.loading = false;
        this.errors = [];

        io.on('JoinGameSuccess', function(){
            console.info('Received JoinGameSuccess, emitting GetGameActions:', this.game.getId());
            io.emit('GetGameActions', { game: this.game.getId() });
        }.bind(this));

        io.on('GameActions', function(data){
            console.info('Received GameActions:', data);
            this.loadActions(data);
            this.emit('change');
        }.bind(this));

        io.on('GameAction', function(action){
            console.info('Received GameAction:', action);
            this.loadAction(action);
            this.emit('change');
        }.bind(this));
    },

    bindActions: function () {
        return {
            NEW_GAME_SUCCESS: this.newGame,
            NEW_GAME_FAILURE: this.newGameFailed,
            GAME_SUCCESS: this.joinGame,
            GAME_FAILURE: this.newGameFailed
        };
    },

    newGame: function(data) {
        this.joinGame(data.doc);
    },

    joinGame: function(gameDoc) {
        this.loading = false;
        this.errors = [];
        this.game = new Game(gameDoc, [], this.flux.store('Users').getLoggedInUser()._id, this.makeMove.bind(this), { skipPlay: true });

        console.info('Emitting JoinGame:', this.game.getId());
        io.emit('JoinGame', { game: this.game.getId() });

        this.emit('change');
    },

    newGameFailed: function() {
        this.loading = false;
        this.errors = ['Couldn\'t create a new game'];
        this.game = null;
        this.emit('change');
    },

    loadActions: function(actions) {
        this.game.pushActions(actions);
    },

    loadAction: function(action) {
        this.game.pushActions([action]);
    },

    makeMove: function(action) {
        console.info('Emitting PostGameAction:', action);
        io.emit('PostGameAction', { game: this.game.getId(), value: action });
    }
}));