var _ = require('lodash'),
    mongoose = require('mongoose'),
    Actions = require('./Actions');

var randomUniqueArray = function(length, min, max) {
    var rands = [], tries = 0;
    do {
        if (tries++ > 100) {
            throw new Error('Had a problem generating unique random numbers');
        }
        rands = rands.push(_.random(min, max)) && _.uniq(rands);
    } while (rands.length !== length);
    return rands;
};

var Game = function(game, actions){
    this.game = game;
    this.actions = actions;
};

Game.prototype.setup = function(){
    // Setup can only be done before any actions
    if (this.actions && this.actions.length) {
        throw new Error('Cannot setup a game that already has actions');
    }

    var gid = this.game._id,
        GameAction = mongoose.model('GameAction');

    // Determine player order
    var rands = randomUniqueArray(this.game.players.length, 1, 10000);

    // Give players their starting order and other stuff
    this.game.players.forEach(function(user, i){
        if (!user) {
            return;
        }

        var uid = user._id;

        // order
        GameAction.record({
            game: gid,
            user: uid,
            action: Actions.ASSIGN_PLAYER_ORDER.value,
            value: rands[i]
        });

        // gold
        GameAction.record({
            game: gid,
            user: uid,
            action: Actions.GOLD.value,
            value: 3
        });

        // imps
        GameAction.record({
            game: gid,
            user: uid,
            action: Actions.IMPS.value,
            value: 3
        });

        // food
        GameAction.record({
            game: gid,
            user: uid,
            action: Actions.FOOD.value,
            value: 3
        });

        // initial orders
        GameAction.record({
            game: gid,
            user: uid,
            action: Actions.PICK_INITIAL_ORDERS.value,
            value: randomUniqueArray(3, 1, 8)
        });
    }.bind(this));
};

Game.prototype.move = function(user, move){
    console.log('MOVE USER: ' + user.name + ' MOVE: ' + JSON.stringify(move));
};

module.exports = Game;