var rest = require('rest'),
    mime = require('rest/interceptor/mime'),
    client = rest.wrap(mime, { mime: 'application/json' }),
    path = '/api/v1/';

var ref = function(id) {
    if (!id) { return null; }
    return { _id: id };
};

module.exports = {
    Users: {
        get: function(){
            return client({ path: path + 'Users' }).then(function(response){ return response.entity; });
        }
    },

    Games: {
        get: function(id) {
            return client({ path: path + 'Games/' + id }).then(function(response) { return response.entity; });
        },
        post: function(data) {
            // expecting data.title, data.player1, data.player2, etc, but need model-like syntax
            var entity = {};
            entity.title = data.title;
            entity.players = [ref(data.player1), ref(data.player2), ref(data.player3), ref(data.player4)];
            return client({ path: path + 'Games', method: 'POST', entity: entity }).then(function(response){ return response.entity });
        }
    }
};