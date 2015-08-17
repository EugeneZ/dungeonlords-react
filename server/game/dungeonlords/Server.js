var _ = require('lodash'),
    mongoose = require('mongoose'),
    Game = require('./../../../game/dungeonlords/Game');

module.exports = {

    // checks to see if the server needs to make some moves when someone joins a game. This is the only way to unstick stuck games
    joinGameSetup: function(gid, uid, cb, fcb) {
        getGame(gid, uid, function(game, gameDoc){
            makeServerMovesFn(game, gameDoc, uid, cb, fcb);
        }, fcb);
    },

    // A user wants to make a move. This may result in the server making follow-up moves
    move: function(gid, uid, value, cb, fcb){
        getGame(gid, uid, function(game, gameDoc){
            recordMoveValue(game, gameDoc, uid, value, false, cb, fcb);
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
    mongoose.model('Game').findById(gid).then(function(gameDoc){
        mongoose.model('GameAction').find({ game: gid }).then(function(gameActionDocs){
            cb(new Game(gameDoc, gameActionDocs, uid, null, { isServer: true }), gameDoc);
        }, function(err){
            return fcb(err);
        });
    }, function(err) {
        return fcb(err);
    });
}

function makeServerMovesFn(game, gameDoc, uid, cb, fcb) {
    var move = game.getServerMoves();
    if (move && move.length) {
        move = move[0];
        recordMoveValue(game, gameDoc, uid, move, true, function(action){
            if (cb) {
                cb(action);
            }
        }, fcb);
        return true;
    } else {
        return false;
    }
}

function recordMoveValue(game, gameDoc, uid, move, isServer, cb, fcb) {
    if (!isServer && !game.isLegal(move)){
        throw new Error('Illegal move... TODO: this should be reported to the client somehow'); //TODO
    }

    mongoose.model('GameAction').create({
        game: gameDoc.id,
        user: isServer ? null : uid,
        action: move.type,
        value: move.value
    }).then(function(actionDoc){
        getGame(gameDoc.id, uid, function(game, gameDoc){
            if (!makeServerMovesFn(game, gameDoc, uid, cb, fcb)){
                cb(actionDoc);
            }
        }, fcb);
    }, function(err){
        console.log('error', err);
        fcb(err);
    });
}