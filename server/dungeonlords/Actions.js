var _ = require('lodash');

// The term 'value' in comments refers to the value of an action with this type, not the enum value in this file. Confusing, I know.
var Actions = {
    ASSIGN_PLAYER_ORDER: { value: 1 }, // Value is a die roll of any number that determines the player's turn order.
    PHASE: { value: 2 }, // No value, each time this action is called it indicates completion of the current phase
    GOLD: { value: 3 }, // Value is number of gold gained (negative for gold lost)
    IMPS: { value: 4 }, // Value is number of imps gained (negative for imps lost)
    FOOD: { value: 5 }, // Value is number of food gained (negative for food lost)
    PLACEHOLDER: { value: 6},
    REP: { value: 7 }, // Value is the amount of evil gained (negative for evil lost)
    ROOM: { value: 8 }, // Value is in the form: { row: 1-4, column: 1-5, id: Number} where the id is the type of room/tunnel.
    TRAP: { value: 9, private: true }, // Value is the id of the trap looked at or gained, negative for lost trap
    REVEAL_MONSTER: { value: 10 }, // Value is an array of ids of the revealed monsters
    REVEAL_ROOM: { value: 11 }, // Value is an array of the ids of the revealed rooms
    ASSIGN_ADVENTURER: { value: 12 }, // Value is the id of the assigned adventurer (usually fired during Adventurers Phase, but can fire any time for the paladin
    ASSIGN_SECRET_ORDER: { value: 13 }, // Value is an array of order ids
    ASSIGN_DUMMY_MARKER: { value: 14 }, // Value is an array of arrays for each dummy player, with the inner arrays containing 3 order ids
    PICK_INITIAL_ORDERS: { value: 15, private: true }, // Value is an array of the initial order ids
    SLOT_UNUSABLE_ORDER: { value: 16 } // Value is an array of unusable order ids
};

Actions._privateValues = _.transform(Actions,function(_private, props){
    if (props.private) {
        _private.push(props.value);
    }
}, []);

Actions._privateKeys = _.transform(Actions, function(_private, props, key){
    if (props.private) {
        _private.push(key);
    }
}, []);

Actions._serverValues = _.transform(Actions, function(_private, props){
    if (props.server) {
        _private.push(props.value);
    }
}, []);

Actions._serverKeys = _.transform(Actions, function(_private, props, key){
    if (props.server) {
        _private.push(key);
    }
}, []);

Actions._keyOf = _.chain(Actions).mapValues(function(v){ return v.value; }).invert().value();

module.exports = Actions;