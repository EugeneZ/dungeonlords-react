var api = require('../api'),
    router = require('../router');

module.exports = {
    newGame: function(data) {
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