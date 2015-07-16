var Monster = {};
var Enum = Monster.Enum = {
    GOBLIN: 1,
    SLIME: 2,
    GHOST: 3,
    TROLL: 4,
    WITCH: 5,
    VAMPIRE: 6,
    GOLEM: 7,
    DRAGON: 8,
    DEMON: 9
};

Monster.YearOne = [
    Enum.GOBLIN,
    Enum.GOBLIN,
    Enum.SLIME,
    Enum.SLIME,
    Enum.GHOST,
    Enum.GHOST,
    Enum.TROLL,
    Enum.TROLL,
    Enum.WITCH,
    Enum.WITCH,
    Enum.VAMPIRE,
    Enum.VAMPIRE
];

Monster.YearTwo = [
    Enum.GOBLIN,
    Enum.SLIME,
    Enum.GHOST,
    Enum.TROLL,
    Enum.WITCH,
    Enum.VAMPIRE,
    Enum.GOLEM,
    Enum.GOLEM,
    Enum.DRAGON,
    Enum.DRAGON,
    Enum.DEMON,
    Enum.DEMON
];

Monster[Enum.GOBLIN] = {
    cost: {
        food: 1
    },
    attack: {
        damage: 2,
        onKill: 1
    }
};

Monster[Enum.SLIME] = {
    cost: {
        food: 2
    },
    attack: {
        choice: {
            damageAll: 1,
            preventFatigueAndConquering: true
        }
    }
};

Monster[Enum.GHOST] = {
    cost: {
        evil: 1
    },
    attack: {
        damageNonLeader: 2
    },
    isGhost: true
};

Monster[Enum.TROLL] = {
    cost: {
        food: 2
    },
    attack: {
        choice: {
            damage: 3,
            eatAndDamage: 4
        }
    },
    isTroll: true
};

Monster[Enum.WITCH] = {
    cost: {
        evil: 1,
        food: 1
    },
    attack: {
        choice: {
            damageAnyTwice: 1,
            damage: 4
        }
    }
};

Monster[Enum.VAMPIRE] = {
    cost: {
        evil: 2
    },
    attack: {
        choice: {
            damageNonCleric: 3,
            damageNonClericAndReturn: 2
        }
    }
};

Monster[Enum.GOLEM] = {
    cost: {
        gold: 1,
        trap: 1
    },
    attack: {
        damageAndReturn: 4
    }
};

Monster[Enum.DRAGON] = {
    cost: {
        food: 2,
        evil: 2
    },
    attack: {
        damageAll: 2,
        preventHealing: true
    }
};

Monster[Enum.DEMON] = {
    cost: {
        monster: 1,
        evil: 1
    },
    attack: {
        damageAny: 7,
        preventFatigueAndConquering: true
    }
};

module.exports = Monster;