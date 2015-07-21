var Area = [];

var Type = Area.Type = {
    GET_FOOD: 1,
    IMPROVE_REPUTATION: 2,
    DIG_TUNNELS: 3,
    MINE_GOLD: 4,
    RECRUIT_IMPS: 5,
    BUY_TRAPS: 6,
    HIRE_MONSTER: 7,
    BUILD_ROOM: 8
};

Area[Type.GET_FOOD] = {
    0: {
        input: {
            gold: 1
        },
        output: {
            food: 2
        }
    },
    1: {
        input: {
            evil: 1
        },
        output: {
            food: 3
        }
    },
    2: {
        input: {
            evil: 2
        },
        output: {
            food: 3,
            gold: 1
        }
    }
};

Area[Type.IMPROVE_REPUTATION] = {
    0: {
        output: {
            evil: -1,
            peek: true
        }
    },
    1: {
        output: {
            evil: -2
        }
    },
    2: {
        input: {
            gold: 1
        },
        output: {
            evil: -2,
            peek: true
        }
    }
};

Area[Type.DIG_TUNNELS] = {
    0: {
        input: {
            imps: 2,
            emptyDungeonSpaces: 2
        },
        output: {
            tunnels: 2
        }
    },
    1: {
        input: {
            imps: 3,
            emptyDungeonSpaces: 3
        },
        output: {
            tunnels: 3
        }
    },
    2: {
        input: {
            imps: 5,
            emptyDungeonSpaces: 4
        },
        output: {
            tunnels: 4
        }
    }
};

Area[Type.MINE_GOLD] = {
    0: {
        input: {
            imps: 2,
            minableRooms: 2
        },
        output: {
            gold: 2
        }
    },
    1: {
        input: {
            imps: 3,
            minableRooms: 3
        },
        output: {
            gold: 3
        }
    },
    2: {
        input: {
            imps: 5,
            minableRooms: 4
        },
        output: {
            gold: 4
        }
    }
};

Area[Type.RECRUIT_IMPS] = {
    0: {
        input: {
            food: 1
        },
        output: {
            imps: 1
        }
    },
    1: {
        input: {
            food: 2
        },
        output: {
            imps: 2
        }
    },
    2: {
        input: {
            food: 1,
            gold: 1
        },
        output: {
            imps: 2
        }
    }
};

Area[Type.BUY_TRAPS] = {
    0: {
        input: {
            gold: 1
        },
        output: {
            traps: 1
        }
    },
    1: {
        output: {
            traps: 1
        }
    },
    2: {
        input: {
            gold: 2
        },
        output: {
            traps: 2
        }
    }
};

Area[Type.HIRE_MONSTER] = {
    0: {
        input: {
            payday: true
        },
        output: {
            monster: 1
        }
    },
    1: {
        input: {
            payday: true
        },
        output: {
            monster: 1
        }
    },
    2: {
        input: {
            payday: true,
            food: 1
        },
        output: {
            monster: 1
        }
    }
};

Area[Type.BUILD_ROOM] = {
    0: {
        input: {
            roomAvailable: true
        },
        output: {
            room: 1
        }
    },
    1: {
        output: {
            room: 1
        }
    },
    2: {
        output: {
            room: 1
        }
    }
};

module.exports = Area;