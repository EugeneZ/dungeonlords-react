var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * GameAction Schema
 */

var GameActionSchema = new Schema({
    game: {
        type: String,
        required: true
    },
    user: {
        type: String
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
    next();
});

mongoose.model('GameAction', GameActionSchema);