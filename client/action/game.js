var api = require('../api'),
    router = require('../router'),
    _ = require('lodash');

module.exports = {
    newGame: function(data) {
        var creationStub = {
            title: data.title,
            player1: data.player1,
            player2: data.player2
        };
        if (data.player3) {
            creationStub.player3 = data.player3;
        }
        if (data.player4) {
            creationStub.player4 = data.player4;
        }

        this.dispatch('NEW_GAME', creationStub);

        api.Games.post(creationStub).then(function(response) {
            this.dispatch('NEW_GAME_SUCCESS', { creationStub: creationStub, doc: response });
            if (response && response._id) {
                router.transitionTo('game', { id: response._id});
            }
        }.bind(this), function(err){
            this.dispatch('NEW_GAME_FAILURE', err);
        }.bind(this));
    },

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

    makeMove: function() {
        this.dispatch('MAKE_MOVE');
    },

    undoClicked: function() {
        this.dispatch('UNDO');
    },

    orderClicked: function(order) {
        this.dispatch('ORDER', order);
    }
};