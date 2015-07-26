var DungeonTile = require('./DungeonTile'),
    Monster     = require('./Monster'),
    Area        = require('./Area'),
    Immutable   = require('immutable');

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

var Player = function(playerDoc){
    this.getId = function() { return playerDoc.id; };
    this.getName = function() { return playerDoc.name; };

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

    var usedImps = 0;
    this.getUsedImps = function() { return usedImps; };
    this.useImps = function(number) { usedImps += number };
    this.bringImpsHome = function() { usedImps = 0; };

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
    this.getBuildableSpaces = function(dungeon, forRooms){
        var spaces = [],
            isAdjacentToDungeon = false,
            isLegalToBuildTunnel = false,
            isLegalToBuildroom = false,
            adjacentTiles;
        for (var column in dungeon) {
            for (var row in dungeon[column]) {
                if (!dungeon[column][row] || (forRooms && dungeon[column][row] === 1)) {
                    isAdjacentToDungeon = false;
                    isLegalToBuildTunnel = true;
                    isLegalToBuildroom = true;
                    adjacentTiles = { above: false, aboveRight: false, right: false, belowRight: false, below: false, belowLeft: false, left: false, aboveLeft: false };
                    if (row > 0 && dungeon[column][row - 1]) {
                        adjacentTiles.above = dungeon[column][row - 1];
                    }
                    if (row > 0 && column < 4 && dungeon[column + 1][row - 1]) {
                        adjacentTiles.aboveRight = dungeon[column + 1][row - 1];
                    }
                    if (column < 4 && dungeon[column + 1][row]) {
                        adjacentTiles.right = dungeon[column + 1][row];
                    }
                    if (row < 3 && column < 4 && dungeon[column + 1][row + 1]) {
                        adjacentTiles.belowRight = dungeon[column + 1][row + 1];
                    }
                    if (row < 3 && dungeon[column][row + 1]) {
                        adjacentTiles.below = dungeon[column][row + 1];
                    }
                    if (row < 3 && column > 0 && dungeon[column - 1][row + 1]) {
                        adjacentTiles.belowLeft = dungeon[column - 1][row + 1];
                    }
                    if (column > 0 && dungeon[column - 1][row]) {
                        adjacentTiles.right = dungeon[column - 1][row];
                    }
                    if (row > 0 && column > 0 && dungeon[column - 1][row - 1]) {
                        adjacentTiles.aboveLeft = dungeon[column - 1][row - 1];
                    }

                    if (forRooms) {
                        ['above', 'right', 'below', 'left'].forEach(function(location){
                            if (adjacentTiles[location] && adjacentTiles[location] >= 3) {
                                isLegalToBuildroom = false;
                            }
                        });

                        if (isLegalToBuildroom) {
                            spaces.push({column: column, row: row});
                        }

                    } else {
                        if (adjacentTiles.above || adjacentTiles.right || adjacentTiles.below || adjacentTiles.left) {
                            isAdjacentToDungeon = true;
                        }
                        if (adjacentTiles.above && adjacentTiles.right && adjacentTiles.aboveRight) {
                            isLegalToBuildTunnel = false;
                        }
                        if (adjacentTiles.right && adjacentTiles.below && adjacentTiles.belowRight) {
                            isLegalToBuildTunnel = false;
                        }
                        if (adjacentTiles.left && adjacentTiles.below && adjacentTiles.belowLeft) {
                            isLegalToBuildTunnel = false;
                        }
                        if (adjacentTiles.left && adjacentTiles.above && adjacentTiles.aboveLeft) {
                            isLegalToBuildTunnel = false;
                        }

                        if (isLegalToBuildTunnel && isAdjacentToDungeon) {
                            spaces.push({column: column, row: row});
                        }
                    }
                }
            }
        }

        return spaces;
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
    this.getAdventurers = function(){ return Immutable.fromJS(adventurers); };
    this.assignAdventurer = function(adventurer) {
        if (adventurers.indexOf(adventurer) !== -1) {
            return false;
        }

        adventurers.push(adventurer);
        return true;
    };

    // Paladin stuff
    var hasPaladin = false;
    this.hasPaladin = function(){ return hasPaladin; };
    this.setPaladin = function(bool){ hasPaladin = bool; };

    // How many -3 point marks you have on your account. These are the red cubes in the upper right of the board
    var deadLetters = 0;
    this.countDeadLetters = function(){ return deadLetters; };
    this.gainDeadLetter = function(){
        return !!deadLetters++;
    };

    var heldOrders = [];
    this.getHeldOrders = function(){ return Immutable.fromJS(heldOrders); };
    this.setHeldOrders = function(orders) { heldOrders = orders; };

    var orders = [];
    this.getOrders = function(){ return Immutable.fromJS(orders); };
    this.setOrders = function(orderArray){ orders = orderArray; heldMinion = false; };

    var heldMinion = false;
    this.isMinionHeld = function(){ return heldMinion; };
    this.setMinionHeld = function(){ heldMinion = value; };

    this.checkCost = function(input, tilesOnOffer){
        if (!input) {
            return true;
        }
        var soFarSoGood = true;
        for (var item in input) {
            if (item === 'gold'){
                 soFarSoGood = gold >= input[item];
            } else if (item === 'evil') {
                soFarSoGood = evil + input[item] <= 15;
            } else if (item === 'imps') {
                soFarSoGood = imps - usedImps >= (input['foreman'] ? 2 : 1);
            } else if (item === 'food') {
                soFarSoGood = food - input[item] >= 0;
            } else if (item === 'gold') {
                soFarSoGood = gold - input[item] >= 0;
            } else if (item === 'trap') {
                soFarSoGood = traps.length !== 0;
            } else if (item === 'monster') {
                soFarSoGood = monsters.length !== 0;
            } else if (item === 'emptyDungeonSpaces') {
                soFarSoGood = this.getBuildableSpaces(dungeon).length > 0;
            } else if (item === 'legalRoomSpaces') {
                soFarSoGood = this.getBuildableSpaces(dungeon, true).length > 0;
            } else if (item === 'minableTiles') {
                soFarSoGood = false;
                for (var column in dungeon) {
                    for (var row in dungeon) {
                        if (dungeon[column][row] && dungeon[column][row] != 2 && dungeon[column][row] != 3) {
                            soFarSoGood = true;
                        }
                    }
                }
            } else if (item === 'roomAvailable') {
                soFarSoGood = tilesOnOffer.rooms.length !== 0;
            } else if (item === 'payday') {
                soFarSoGood = false;
                tilesOnOffer.monsters.forEach(function(monster){
                    if (this.checkCost(Monster[monster].cost)) {
                        soFarSoGood = true;
                    }
                }.bind(this));
            }

            if (!soFarSoGood) {
                return false;
            }
        }
    }
};



module.exports = Player;