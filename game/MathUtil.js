var GameMath = {
    randomUniqueArray: function (length, min, max) {
        var rands = [], tries = 0;
        do {
            if (tries++ > 100) {
                throw new Error('Had a problem generating unique random numbers');
            }
            rands = rands.push(_.random(min, max)) && _.uniq(rands);
        } while (rands.length !== length);
        return rands;
    },

    pullFromDeck: function(length, min, max) {
    }
};

module.exports = GameMath;