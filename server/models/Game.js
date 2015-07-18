var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    GameServer = require('../game/dungeonlords/Server'),
    debug = require('debug')('db'),
    _ = require('lodash');

/**
 * Game Schema
 */

var GameSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    players: [{
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        }
    }],
    created: {
        type: Date,
        default: Date.now
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save hook
 */
GameSchema.pre('save', function(next) {
    if (this.isNew && this.players.length < 2) {
        return next(new Error('Two players are required'));
    } else if (this.isNew) {
        var errors = false;

        this.players = _.compact(this.players);

        mongoose.model('User').update(
            { _id: { $in: this.players } },
            { $push: { games: { _id: this._id }}},
            { multi: true },
            function(err, n, r){
                if (err) {
                    debug(err);
                    errors = next(new Error('Couldn\'t add players to game: ' + err));
                }
            }
        );
        if (errors !== false) {
            return errors;
        }
    }
    this.lastPlayed = Date.now();
    next();
});

/**
 * Post-save hook
 */
GameSchema.post('save', function(game) {
    //GameServer.newGameSetup(game);
});

/**
 * Statics
 */
GameSchema.statics.get = function(id, cb) {
    this.findOne({ id: id }).exec(cb);
};

mongoose.model('Game', GameSchema);