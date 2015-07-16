var _ = require('lodash');

var Action = {};

var Type = Action.Type = {
    WAITING_FOR_SERVER: 1,
    WAITING_FOR_OTHERS: 2,
    SELECT_INITIAL_ORDERS: 3,   // Choose your starting orders
    SELECT_ORDERS: 4,           // Choose your secret orders!
    CONFIRM_ACTION: 5,          // For non-interactive actions, a confirmation that you want to take it.
    SELECT_TRAPS: 6,            // During year 2 you draw an extra trap but must discard one of those 2 or another you own
    SELECT_IMPS: 7,             // For the tunnel/gold actions, how many imps do you want to commit? Don't forget foreman if you need one
    SELECT_TUNNELS: 8,          // Where do you want to dig tunnels? No 2x2s
    SELECT_MONSTER: 9,          // When buying monsters, which one? You must be able to afford it
    SELECT_ROOM: 10,            // When buying rooms, which one and where do you place it? You need a legal spot before you can buy.
    SELECT_PRODUCTION: 11,      // Which rooms do you want to produce in?
    SELECT_TAKE_BACK: 12,       // if you have a minion 'hold' an order because you chose not to use it or couldn't, this is where you choose whether to take it back
    SELECT_PAYDAY: 13,          // For each monster you can afford to pay, do you want to? Lose monster and gain evil if not.
    SELECT_TAXES: 14,           // How much tax do you want to pay? (Dead letter per unpaid)
    SELECT_COMBAT_PLANNING: 15, // Planning phase of combat
    SELECT_COMBAT: 16,          // Decisions made after revealing the combat card for that round (your traps/monster choices from planning are committed now)
    EXECUTE_ORDERS: 17,
    SELECT_ADVENTURER: 18,
    ASSIGN_PLAYER_ORDER: 19,
    ASSIGN_INITIAL_ORDERS: 20,
    ASSIGN_DUMMY_ORDERS: 21,
    REVEAL_NEW_ROUND_DATA: 22,
    REVEAL_INITIAL_ORDERS: 23
};

/**
 * Action handlers are simple objects with a standard format.
 * @param serverOnly {boolean} When set to true, only the server is allowed to create these actions. From the player perspective they are read-only.
 * @param secret {boolean} When set to true, the values are obscured when sent to a player whose id is not in the dataset.
 * @param create {Function} Required. Creates an object that contains the data and may have setters to add additional data. This object must implement a 'serialize' method that returns a JSON
 * object reprenting the data. This will be stored in the db.
 * @param deserialize {Function} Required. Invoked when the action is retrieved from the db to reconstitute an object that either contains the data or has getters to obtain the data.
 */

Action[Type.ASSIGN_PLAYER_ORDER] = {
    serverOnly: true,
    create: function(orderArray) {
        return function(){
            this.prototype.serialize = function(){ return { type: Type.ASSIGN_PLAYER_ORDER, value: orderArray }; };
        };
    },

    deserialize: function(data){
        return data.value;
    }
};

Action[Type.ASSIGN_INITIAL_ORDERS] = {
    serverOnly: true,
    create: function() {
        return function(){
            var value = [];
            this.prototype.serialize = function() {
                return { type: Type.ASSIGN_INITIAL_ORDERS, value: value };
            };
            this.prototype.addPlayer = function(id, orderArray) {
                value.push({ id: id, orders: value });
            };
            this.prototype.addDummyPlayer = function(orderArray, associatedPlayerId) {
                value.push({ id: associatedPlayerId, dummy: true, orders: orderArray });
            }
        };
    },

    deserialize: function(data) {
        return {
            getInitialOrders: function(playerId) {
                var player = _.find(data.value, { id: playerId });
                if (!player) {
                    throw new Error('Initial orders requested for player but that players data is missing.');
                }
                return player.orders;
            },

            getHeldDummyOrders: function(playerId) {
                var dummyOrders = _.filter(data.value, { dummy: true });
                if ((dummyOrders.length === 0) || (dummyOrders.length > 2) || (!playerId && dummyOrders.length === 2) || (playerId && dummyOrders.length === 1)) {
                    throw new Error('Held dummy orders requested but the wrong number of dummy order sets were found for the number of players.');
                }
                if (dummyOrders.length === 1) {
                    return dummyOrders[0].orders;
                } else {
                    var result =  _.find(data.value, { dummy: true, id: playerId });
                    if (!result) {
                        throw new Error('Held dummy orders requested but no dummy orders for specified player id exist.');
                    }
                    return result.orders;
                }
            }
        }
    }
};

Action[Type.SELECT_INITIAL_ORDERS] = {
    secret: true,
    create: function(playerId, orderArray){
        return function(){
            this.prototype.serialize = function(){
                return { type: Type.SELECT_INITIAL_ORDERS, value: { id: playerId, orders: orderArray } };
            };
        }
    },

    deserialize: function(data){
        return data.value;
    }
};

Action[Type.REVEAL_INITIAL_ORDERS] = {
    serverOnly: true,
    create: function(){
        return function(){
            var value = [];
            this.prototype.serialize = function(){
                return { type: Type.REVEAL_INITIAL_ORDERS, value: value };
            };
            this.prototype.addPlayer = function(playerId, ordersArray) {
                value.push({ id: playerId, orders: ordersArray });
            };
        }
    },

    deserialize: function(){
        return {
            getRevealedInitialOrders: function(playerId) {
                var player = _.find(data.value, { id: playerId });
                if (!player) {
                    throw new Error('Revealed initial orders requested for player but that players data is missing.');
                }
                return player.orders;
            }
        }
    }
};

Action[Type.SELECT_ORDERS] = {
    secret: true,
    create: function(playerId, orderArray){
        return function(){
            var value = { id: playerId, orders: orderArray };
            this.prototype.serialize = function(){
                return { type: Type.SELECT_ORDERS, value: value };
            };
            this.prototype.addDummyOrder = function(dummyOrder) {
                value.dummyOrder = dummyOrder;
            };
        }
    },

    deserialize: function(data){
        return data.value; // id, orders, dummyOrder
    }
};

Action[Type.ASSIGN_DUMMY_ORDERS] = {
    serverOnly: true,
    create: function(playerId, dummyOrdersArray){
        return function(){
            this.prototype.serialize = function(){
                return { type: Type.ASSIGN_DUMMY_ORDERS, value: { id: playerId, orders: dummyOrdersArray }};
            };
        }
    },

    deserialize: function(data){
        return function(){
            this.prototype.getHeldDummyOrders = function(playerId) {
                if (!playerId) {
                    return data.value.orders;
                } else {
                    var orders = _.find(data.value, {id: playerId});
                    if (!orders) {
                        throw new Error('Held dummy orders requested but orders for the specified id do not exist.');
                    }
                    return orders.orders;
                }
            }
        }
    }
};

Action[Type.REVEAL_NEW_ROUND_DATA] = {
    create: function(){
        return function(){
            var value = {};
            this.prototype.serialize = function(){
                return { type: Type.REVEAL_NEW_ROUND_DATA, value: value };
            };
            this.prototype.newMonsters = function(monster1, monster2, monster3) {
                value.monsters = [monster1, monster2, monster3];
            };
            this.prototype.newRooms = function(room1, room2) {
                value.rooms = [room1, room2];
            };
            this.prototype.newAdventurers = function(adventurer1, adventurer2, adventurer3, adventurer4) {
                value.adventurers = [adventurer1, adventurer2, adventurer3, adventurer4];
            };
            this.prototype.newEvent = function(event) {
                value.event = event;
            }
        }
    },

    deserialize: function(data){
        return data.value;
    }
};

module.exports = Action;

/*
Sample action definition:
Action[Type.SELECT_ORDERS] = {
    create: function(){
        return function(){
            this.prototype.serialize = function(){

            };
        }
    },

    deserialize: function(data){

    }
};
 */