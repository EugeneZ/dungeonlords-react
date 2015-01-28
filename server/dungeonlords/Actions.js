var _ = require('lodash');

var Actions = {
    ASSIGN_PLAYER_ORDER: { value: 1 },
    PHASE: { value: 2 },
    GOLD: { value: 3 },
    IMPS: { value: 4 },
    FOOD: { value: 5 },
    TUNNEL: { value: 6 },
    REP: { value: 7 },
    ROOM: { value: 8 },
    TRAP: { value: 9 },
    REVEAL_MONSTER: { value: 10 },
    REVEAL_ROOM: { value: 11 },
    MOVE_PALADIN: { value: 12 },
    ASSIGN_SECRET_ORDER: { value: 13 },
    REVEAL_ORDERS: { value: 14 },
    PICK_INITIAL_ORDERS: { value: 15, private: true },
    SLOT_UNUSABLE_ORDER: { value: 16 }
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

module.exports = Actions;