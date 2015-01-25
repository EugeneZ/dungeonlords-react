'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    DLGame = require('../dungeonlords/Game');

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
    }
    this.lastPlayed = Date.now();
    next();
});

/**
 * Post-save hook
 */
GameSchema.post('save', function(game) {
    var logic = new DLGame(game);
    logic.setup();
});

/**
 * Statics
 */
GameSchema.statics.get = function(id, cb) {
    this.findOne({ id: id }).exec(cb);
};

mongoose.model('Game', GameSchema);