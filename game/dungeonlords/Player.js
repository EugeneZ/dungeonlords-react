var DungeonTile = require('./DungeonTile');
var Monster = require('./Monster');
var Immutable = require('immutable');

var generateAdjuster = function(name, isLoser, min, max){
    min = parseInt(min, 10) || 0;
    max = parseInt(max, 10) || Infinity;
    return function(quantity){
        quantity = parseInt(quantity, 10);
        if (quantity < 0) {
            throw new Error('Player tried to ' + (isLoser ? 'lose' : 'gain') + ' negative ' + name + '!');
        }
        if (isLoser) {
            quantity *= -1;
        }

        if ((this[name] + quantity < min) || (this[name] + quantity > max)) {
            return false;
        }

        this[name] += quantity;

        return true;
    }.bind(this);
};

var Player = function(name, id){
    this.getId = function() { return id; };
    this.getName = function() { return name; };

    var waiting = false;
    this.isWaiting = function() { return waiting; };
    this.setWaiting = function() { waiting = true; };

    var directive;
    this.getDirective = function() { return directive; };
    this.setDirective = function(dctive) {
        directive = dctive;
        waiting = false;
    };

    var action = null;
    this.getAction = function() { return action; };

    var gold = 3;
    this.getGold = function() { return gold; };
    this.checkGold = function() { return gold != 0; };
    this.gainGold = generateAdjuster.call(this, 'gold');
    this.loseGold = generateAdjuster.call('gold', true);

    var imps = 3;
    this.getImps = function() { return imps; };
    this.checkImps = function() { return imps != 0; };
    this.gainImps = generateAdjuster.call('imps');
    this.loseImps = generateAdjuster.call('imps', true);

    var food = 3;
    this.getFood = function() { return food; };
    this.checkFood = function() { return food != 0; };
    this.gainFood = generateAdjuster.call('food');
    this.loseFood = generateAdjuster.call('food', true);

    // Evilmeter. Higher means more evil. Minimum of 1 (nicest), maximum of 15 (evilest), starting at 5, paladin space is 10.
    var evil = 5;
    this.getEvil = function() { return evil; };
    this.checkEvil = function() { return evil != 15; };
    this.gainEvil = generateAdjuster.call('evil', false, 1, 15);
    this.loseEvil = generateAdjuster.call('evil', true, 1, 15);

    // Traps: PRIVATE CONTENTS, but the length is public. Private traps are added as 0's.
    var traps = [];
    this.getTrapCount = function() { return traps.length; };
    this.checkTrap = function() { return !!traps.length; };
    this.gainTrap = function(trap){
        traps.push(trap);
    };
    this.loseTrap = function(){
        if (traps.length === 0) {
            return false;
        } else if (traps.length === 1) {
            traps = [];
            return true;
        } else {
            action = true; // TODO TODO TODO need an enum for these or something
            return true;
        }
    };

    // Monsters you have in your lair
    var monsters = [];
    this.getMonsters = function(){ Immutable.fromJS(monsters); };
    this.checkMonster = function(){
        return !!monsters.length;
    };
    this.payMonster = function(monster){
        var cost = Monster[monster].cost, amount, delegate, type;
        for (type in cost) {
            delegate = 'check' + type.charAt(0).toUpperCase() + type.slice(1);
            amount = type === 'monster' ? 0 : cost[type]; // To prevent confusion between enums and amounts
            if (!this[delegate](amount)) {
                return false;
            }
        }
        for (type in cost) {
            delegate = 'lose' + type.charAt(0).toUpperCase() + type.slice(1);
            amount = type === 'monster' ? null : cost[type];
            if (!this[delegate](amount)) {
                return false;
            }
        }
        return true;
    };
    this.gainMonster = function(monster, skipPayday){
        if (!skipPayday && !this.payMonster(monster)) {
            return false;
        }
        monsters.push(monster);
        return true;
    };
    this.loseMonster = function(monster){
        if (monster && monsters.indexOf(monster) === -1) {
            return false;
        } else if (monster) {
            monsters.splice(monsters.indexOf(monster), 1);
            return true;
        } else if (monsters.length === 0) {
            return false;
        } else if (monsters.length === 1) {
            monsters = [];
            return true;
        } else {
            action = true; // TODO TODO TODO need an enum for these or something
            return true;
        }
    };

    // A 2d array indicating the contents of your dungeon layout. Access as [column][row]
    var dungeon = [[0,0,0,0],[0,0,0,0],[DungeonTile.TUNNEL,DungeonTile.TUNNEL,DungeonTile.TUNNEL,0],[0,0,0,0],[0,0,0,0]];
    this.getDungeon = function() { return Immutable.fromJS(dungeon); };
    this.conquerTile = function(x, y) {
        if (dungeon[x][y] === DungeonTile.CONQUERED_TUNNEL || dungeon[x][y] === DungeonTile.CONQUERED_ROOM) {
            return false;
        } else if (dungeon[x][y] === DungeonTile.TUNNEL) {
            dungeon[x][y] = DungeonTile.CONQUERED_TUNNEL;
            return true;
        } else {
            dungeon[x][y] = DungeonTile.CONQUERED_ROOM;
            return true;
        }
    };

    // The collection of your prison, used for points/trophies at the end
    var prison = [];
    this.getPrisoners = function(){ return Immutable.fromJS(prison); };
    this.imprisonAdventurer = function(adventurer) {
        if (prison.indexOf(adventurer) !== -1) {
            return false;
        }

        prison.push(adventurer);
        return true;
    };

    // The line outside of your door. Index 0 represents the space closest to the door.
    var adventurers = [];
    this.getPrisoners = function(){ return Immutable.fromJS(adventurers); };
    this.assignAdventurer = function(adventurer) {
        if (adventurers.indexOf(adventurer) !== -1) {
            return false;
        }

        adventurers.push(adventurer);
        return true;
    };

    // How many -3 point marks you have on your account. These are the red cubes in the upper right of the board
    var deadLetters = 0;
    this.gainDeadLetter = function(){
        return !!deadLetters++;
    };

    var heldOrders = [];
    this.getHeldOrders = function(){ return Immutable.fromJS(heldOrders); };
    this.setHeldOrders = function(orders) { heldOrders = orders; }
};

module.exports = Player;