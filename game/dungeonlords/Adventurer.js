var Adventurer = {};

var Enum = Adventurer.Enum = {
    FIGHTER1: 1,
    FIGHTER2: 2,
    FIGHTER3: 3,
    FIGHTER4: 4,
    THIEF1: 5,
    THIEF2: 6,
    THIEF3: 7,
    THIEF4: 8,
    CLERIC1: 9,
    CLERIC2: 10,
    CLERIC3: 11,
    CLERIC4: 12,
    WIZARD1: 13,
    WIZARD2: 14,
    WIZARD3: 15,
    WIZARD4: 16,
    FIGHTER5: 17,
    FIGHTER6: 18,
    FIGHTER7: 19,
    FIGHTER8: 20,
    THIEF5: 21,
    THIEF6: 22,
    THIEF7: 23,
    THIEF8: 24,
    CLERIC5: 25,
    CLERIC6: 26,
    CLERIC7: 27,
    CLERIC8: 28,
    WIZARD5: 29,
    WIZARD6: 30,
    WIZARD7: 31,
    WIZARD8: 32
};

Adventurer.YearOne = [
    Enum.FIGHTER1,
    Enum.FIGHTER2,
    Enum.FIGHTER3,
    Enum.FIGHTER4,
    Enum.THIEF1,
    Enum.THIEF2,
    Enum.THIEF3,
    Enum.THIEF4,
    Enum.CLERIC1,
    Enum.CLERIC2,
    Enum.CLERIC3,
    Enum.CLERIC4,
    Enum.WIZARD1,
    Enum.WIZARD2,
    Enum.WIZARD3,
    Enum.WIZARD4
];

Adventurer.YearTwo = [
    Enum.FIGHTER5,
    Enum.FIGHTER6,
    Enum.FIGHTER7,
    Enum.FIGHTER8,
    Enum.THIEF5,
    Enum.THIEF6,
    Enum.THIEF7,
    Enum.THIEF8,
    Enum.CLERIC5,
    Enum.CLERIC6,
    Enum.CLERIC7,
    Enum.CLERIC8,
    Enum.WIZARD5,
    Enum.WIZARD6,
    Enum.WIZARD7,
    Enum.WIZARD8
];

var Type = Adventurer.Type = {
    Fighter: 0,
    Thief: 1,
    Cleric: 2,
    Wizard: 3
};

Adventurer[Enum.FIGHTER1] = {
    type: Type.Fighter,
    difficulty: 1,
    health: 3
};

Adventurer[Enum.FIGHTER2] = {
    type: Type.Fighter,
    difficulty: 2,
    health: 4
};

Adventurer[Enum.FIGHTER3] = {
    type: Type.Fighter,
    difficulty: 2,
    health: 4
};

Adventurer[Enum.FIGHTER4] = {
    type: Type.Fighter,
    difficulty: 3,
    health: 5
};

Adventurer[Enum.THIEF1] = {
    type: Type.Thief,
    difficulty: 1,
    health: 3,
    power: 1
};

Adventurer[Enum.THIEF2] = {
    type: Type.Thief,
    difficulty: 2,
    health: 3,
    power: 2
};

Adventurer[Enum.THIEF3] = {
    type: Type.Thief,
    difficulty: 2,
    health: 4,
    power: 1
};

Adventurer[Enum.THIEF4] = {
    type: Type.Thief,
    difficulty: 3,
    health: 4,
    power: 2
};

Adventurer[Enum.CLERIC1] = {
    type: Type.Cleric,
    difficulty: 1,
    health: 3,
    power: 1
};

Adventurer[Enum.CLERIC2] = {
    type: Type.Cleric,
    difficulty: 2,
    health: 3,
    power: 2
};

Adventurer[Enum.CLERIC3] = {
    type: Type.Cleric,
    difficulty: 2,
    health: 4,
    power: 1
};

Adventurer[Enum.CLERIC4] = {
    type: Type.Cleric,
    difficulty: 3,
    health: 4,
    power: 2
};

Adventurer[Enum.WIZARD1] = {
    type: Type.Wizard,
    difficulty: 1,
    health: 3,
    power: 1
};

Adventurer[Enum.WIZARD2] = {
    type: Type.Wizard,
    difficulty: 2,
    health: 3,
    power: 2
};

Adventurer[Enum.WIZARD3] = {
    type: Type.Wizard,
    difficulty: 2,
    health: 4,
    power: 1
};

Adventurer[Enum.WIZARD4] = {
    type: Type.Wizard,
    difficulty: 3,
    health: 4,
    power: 2
};

Adventurer[Enum.FIGHTER5] = {
    type: Type.Fighter,
    difficulty: 4,
    health: 5
};

Adventurer[Enum.FIGHTER6] = {
    type: Type.Fighter,
    difficulty: 5,
    health: 6
};

Adventurer[Enum.FIGHTER7] = {
    type: Type.Fighter,
    difficulty: 6,
    health: 7
};

Adventurer[Enum.FIGHTER8] = {
    type: Type.Fighter,
    difficulty: 7,
    health: 8
};

Adventurer[Enum.THIEF5] = {
    type: Type.Thief,
    difficulty: 4,
    health: 4,
    power: 2
};

Adventurer[Enum.THIEF6] = {
    type: Type.Thief,
    difficulty: 5,
    health: 5,
    power: 2
};

Adventurer[Enum.THIEF7] = {
    type: Type.Thief,
    difficulty: 6,
    health: 5,
    power: 3
};

Adventurer[Enum.THIEF8] = {
    type: Type.Thief,
    difficulty: 7,
    health: 6,
    power: 3
};

Adventurer[Enum.CLERIC5] = {
    type: Type.Cleric,
    difficulty: 4,
    health: 4,
    power: 2
};

Adventurer[Enum.CLERIC6] = {
    type: Type.Cleric,
    difficulty: 5,
    health: 5,
    power: 2
};

Adventurer[Enum.CLERIC7] = {
    type: Type.Cleric,
    difficulty: 6,
    health: 5,
    power: 3
};

Adventurer[Enum.CLERIC8] = {
    type: Type.Cleric,
    difficulty: 7,
    health: 6,
    power: 3
};

Adventurer[Enum.WIZARD5] = {
    type: Type.Wizard,
    difficulty: 4,
    health: 4,
    power: 2
};

Adventurer[Enum.WIZARD6] = {
    type: Type.Wizard,
    difficulty: 5,
    health: 5,
    power: 2
};

Adventurer[Enum.WIZARD7] = {
    type: Type.Wizard,
    difficulty: 6,
    health: 5,
    power: 3
};

Adventurer[Enum.WIZARD8] = {
    type: Type.Wizard,
    difficulty: 7,
    health: 6,
    power: 3
};

module.exports = Adventurer;