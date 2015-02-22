var _ = require('lodash'),
    mongoose = require('mongoose'),
    Game = require('./../../../game/dungeonlords/Game');

var maxServerMoves = 50,
    movesMade = 0;

module.exports = {

    // checks if the server needs to make moves on game start up.
    newGameSetup: function(game) {
        game = new Game(game, []);
        makeServerMovesFn(game);
    },

    // checks to see if the server needs to make some moves when someone joins a game. This is the only way to unstick stuck games
    joinGameSetup: function(gid, uid, fcb) {
        getGame(gid, uid, function(game){
            makeServerMovesFn(game);
        }, fcb);
    },

    // A user wants to make a move. This may result in the server making follow-up moves
    move: function(gid, uid, value, cb, fcb){
        getGame(gid, uid, function(game){
            recordMoveValue(game, value, false, cb)
        }, fcb);
    },

    // Retrieves the list of existing moves. They may be filtered based on user.
    getMoves: function(gid, cb, fcb){
        mongoose.model('GameAction').find({ game: gid }, function(err, actions){
            if (err) {
                return fcb(err);
            } else {
                cb(actions);
            }
        });
    }
};

function getGame(gid, uid, cb, fcb) {
    mongoose.model('Game').findById(gid, function(err, gameDoc){
        if (err) {
            return fcb(err);
        }

        mongoose.model('GameAction').find({ game: gid }, function(err, gameActionDocs){
            if (err) {
                return fcb(err);
            }

            cb(new Game(gameDoc, gameActionDocs, uid));
        });
    });
}

function makeServerMovesFn(game, cb) {
    if (game.next.forPlayer.Server !== Game.Move.WAITING_FOR_OTHERS) {

        // Check if we're in an infinite loop
        if (movesMade++ >= maxServerMoves) {
            throw new Error('Server was making too many moves! Infinite loop?');
        }

        // server makes move using recursion
        recordMoveValue(game, game.getServerMoveValue(), true, cb);
    } else {
        movesMade = 0;
    }
}

function recordMoveValue(game, value, isServer, cb) {
    if (!isServer && !game.isLegal(value)){
        throw new Error('Illegal move... TODO: this should be reported to the client somehow'); //TODO
    }

    mongoose.model('GameAction').record({
        game: game.doc._id,
        user: game.uid === 'Server' ? null : game.uid,
        action: game.next.forPlayer[isServer ? 'Server' : game.uid],
        value: value
    }, function(action) {

        if (cb) {
            cb(action);
        }

        // Update the game and check if the server needs to make a move
        game.actions.push(action);
        game.run();
        makeServerMovesFn(game, cb);

    });
}