var Monster = require('./Monster');

var DungeonTile = {};

var Enum = DungeonTile.Enum = {
    EMPTY: 0,
    TUNNEL: 1,
    CONQUERED_TUNNEL: 2,
    CONQUERED_ROOM: 3,
    CHICKEN_COOP: 4,
    MUSHROOM_BED: 5,
    SOUVENIR_SHOP: 6,
    MINT: 7,
    WORKSHOP: 8,
    TOOL_SHED: 9,
    PRINTING_PRESS: 10,
    MAGIC_ROOM: 11,
    TRAINING_ROOM: 12,
    DARK_ROOM: 13,
    LABYRINTH: 14,
    ANTIMAGIC_ROOM: 15,
    CAFETERIA: 16,
    CHAPEL: 17,
    PANDEMONIUM: 18,
    HALL_OF_FAME: 19
};

DungeonTile.YearOne = [
    Enum.CHICKEN_COOP,
    Enum.MUSHROOM_BED,
    Enum.SOUVENIR_SHOP,
    Enum.MINT,
    Enum.WORKSHOP,
    Enum.TOOL_SHED,
    Enum.PRINTING_PRESS,
    Enum.MAGIC_ROOM
];

DungeonTile.YearTwo = [
    Enum.TRAINING_ROOM,
    Enum.DARK_ROOM,
    Enum.LABYRINTH,
    Enum.ANTIMAGIC_ROOM,
    Enum.CAFETERIA,
    Enum.CHAPEL,
    Enum.PANDEMONIUM,
    Enum.HALL_OF_FAME
];

DungeonTile[Enum.CHICKEN_COOP] = {
    input: {
        imps: 3
    },
    output: {
        food: 1
    },
    columns: [0,1,2,3,4],
    rows: [0,1]
};

DungeonTile[Enum.MUSHROOM_BED] = {
    input: {
        imps: 3
    },
    output: {
        food: 1
    },
    columns: [0,1,2,3,4],
    rows: [2,3]
};

DungeonTile[Enum.SOUVENIR_SHOP] = {
    input: {
        imps: 3
    },
    output: {
        gold: 1
    },
    columns: [0,1,2,3,4],
    rows: [0,1]
};

DungeonTile[Enum.MINT] = {
    input: {
        imps: 3
    },
    output: {
        gold: 1
    },
    columns: [0,1,2,3,4],
    rows: [2,3]
};

DungeonTile[Enum.WORKSHOP] = {
    input: {
        imps: 4
    },
    output: {
        trap: 1
    },
    columns: [0,1,2,3,4],
    rows: [0,3],
    alsoLegal: [[0,1],[0,2],[4,1],[4,2]]
};

DungeonTile[Enum.TOOL_SHED] = {
    input: {
        imps: 2
    },
    output: {
        tunnel: 1
    },
    columns: [0,1,2,3,4],
    rows: [0,3],
    alsoLegal: [[0,1],[0,2],[4,1],[4,2]]
};

DungeonTile[Enum.PRINTING_PRESS] = {
    input: {
        imps: 3
    },
    output: {
        evil: -1
    },
    columns: [1,2,3],
    rows: [1,2]
};

DungeonTile[Enum.MAGIC_ROOM] = {
    input: {
        imps: 2,
        food: 1
    },
    output: {
        imps: 1
    },
    columns: [1,2,3],
    rows: [1,2]
};

DungeonTile[Enum.TRAINING_ROOM] = {
    strength: [Monster.Enum.GOBLIN, Monster.Enum.TROLL]
};

DungeonTile[Enum.DARK_ROOM] = {
    strength: [Monster.Enum.WITCH, Monster.Enum.VAMPIRE]
};

DungeonTile[Enum.LABYRINTH] = {
    labyrinth: true
};

DungeonTile[Enum.ANTIMAGIC_ROOM] = {
    antimagic: true
};

DungeonTile[Enum.CAFETERIA] = {
    bonus: [Monster.Enum.GOBLIN, Monster.Enum.TROLL, Monster.Enum.SLIME, Monster.Enum.WITCH]
};

DungeonTile[Enum.CHAPEL] = {
    doublebonus: [Monster.Enum.GHOST, Monster.Enum.VAMPIRE]
};

DungeonTile[Enum.PANDEMONIUM] = {
    doubleBonus: [Monster.Enum.GOLEM, Monster.Enum.DRAGON, Monster.Enum.DEMON]
};

DungeonTile[Enum.HALL_OF_FAME] = {
    hallOfFame: true
};

module.exports = DungeonTile;