var _ = require('lodash'),
    mongoose = require('mongoose'),
    Game = require('./../../../game/dungeonlords/Game');

module.exports = {

    // checks if the server needs to make moves on game start up.
    newGameSetup: function(gameDoc) {
        game = new Game(gameDoc, [], null, null, { isServer: true });
        makeServerMovesFn(game, gameDoc, null, null, function(){});
    },

    // checks to see if the server needs to make some moves when someone joins a game. This is the only way to unstick stuck games
    joinGameSetup: function(gid, uid, fcb) {
        getGame(gid, uid, function(game, gameDoc){
            makeServerMovesFn(game, gameDoc, uid, null, fcb);
        }, fcb);
    },

    // A user wants to make a move. This may result in the server making follow-up moves
    move: function(gid, uid, value, cb, fcb){
        getGame(gid, uid, function(game, gameDoc){
            recordMoveValue(game, gameDoc, uid, value, false, cb, fcb)
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

            cb(new Game(gameDoc, gameActionDocs, uid), gameDoc);
        });
    });
}

function makeServerMovesFn(game, gameDoc, uid, cb, fcb) {
    var moves = game.getServerMoves();
    if (moves && moves.length) {
        moves.forEach(function(move){
            recordMoveValue(game, gameDoc, uid, move, true, cb, fcb);
        });
    }
}

function recordMoveValue(game, gameDoc, uid, move, isServer, cb, fcb) {
    if (!isServer && !game.isLegal(move)){
        throw new Error('Illegal move... TODO: this should be reported to the client somehow'); //TODO
    }

    mongoose.model('GameAction').record({
        game: gameDoc._id,
        user: isServer ? null : uid,
        action: move.type,
        value: move.value
    }, function(action) {

        if (cb) {
            cb(action);
        }

        // Update the game and check if the server needs to make a move
        makeServerMovesFn(getGame(gameDoc._id, uid, cb, fcb), gameDoc, uid, cb, fcb);

    });
}