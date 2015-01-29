var _ = require('lodash'),
    mongoose = require('mongoose'),
    Game = require('./Game'),
    Actions = require('./Actions');

module.exports = {
    newGameSetup: function(game) {
        // Setup can only be done before any actions
        if (game.actions && game.actions.length) {
            throw new Error('Cannot setup a game that already has actions');
        }

        var gid = game._id,
            GameAction = mongoose.model('GameAction');

        // Determine player order
        var rands = randomUniqueArray(game.players.length, 1, 10000);

        // Give players their starting order and other stuff
        game.players.forEach(function(user, i){
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
    },

    move: function(gid, user, move, cb){
        getGame(gid, function(game){

            // !!!!!
            // TODO: Check if this is a legal move!
            // !!!!!

            game.lookupPlayer[user._id].initial.filter(function(order){ return order !== move.value }).forEach(function(order) {
                mongoose.model('GameAction').record({game: gid, user: user._id, action: Actions.SLOT_UNUSABLE_ORDER.value, value: order }, cb);
            });

        }, function(err){
            io.emit('Error', { message: err });
        });
    }
};

function getGame(game, cb, fcb){
    mongoose.model('Game').findById(game, function(err, gameDoc){
        if (err) return fcb(err);
        mongoose.model('GameAction').find({ game: game }, function(err, gameActionDocs){
            if (err) return fcb(err);
            cb(new Game(gameDoc, gameActionDocs));
        });
    });
}

function randomUniqueArray(length, min, max) {
    var rands = [], tries = 0;
    do {
        if (tries++ > 100) {
            throw new Error('Had a problem generating unique random numbers');
        }
        rands = rands.push(_.random(min, max)) && _.uniq(rands);
    } while (rands.length !== length);
    return rands;
}