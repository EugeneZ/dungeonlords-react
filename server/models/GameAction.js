'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Actions = require('../../game/dungeonlords/Actions');

/**
 * GameAction Schema
 */

var GameActionSchema = new Schema({
    game: {
        type: Schema.ObjectId,
        ref: 'Game',
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    action: {
        type: Number,
        required: true
    },
    value: {
        type: Object
    }
});

/**
 * Pre-save hook
 */
GameActionSchema.pre('save', function(next) {
    if (!this.isNew) {
        return next(new Error('Not possible to modify existing game actions'));
    }

    var legal = this.isLegal();
    if (!legal.legal) {
        return next(new Error(legal.reason));
    }

    next();
});

/**
 * Post-save hook
 */
GameActionSchema.post('save', function(game) {
    // notify users
});

/**
 * Methods
 */
GameActionSchema.methods = {

    isLegal: function() {
        //var logic = new DLGame(mongoose.model('Game').get(this.game));
        //return logic.legalMove(this);
        return { legal: true };
    },

    isPrivate: function() {
        return Actions._privateValues.indexOf(this.action) !== -1;
    },

    isServer: function() {
        return Actions._serverValues.indexOf(this.action) !== -1;
    }
};

/**
 * Statics
 */
GameActionSchema.statics.record = function(action, cb){
    this.create(action, function(err, action){
        if (err) {
            throw new Error(err);
        } else if (cb) {
            cb(action);
        }
    })
};

mongoose.model('GameAction', GameActionSchema);