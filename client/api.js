var rest = require('rest'),
    mime = require('rest/interceptor/mime'),
    _    = require('lodash'),
    client = rest.wrap(mime, { mime: 'application/json' }),
    path = '/api/v1/';

module.exports = {
    Users: {
        get: function(id, isGameId){
            var suffix = 'Users';
            if (id && isGameId) {
                var query = JSON.stringify({ games: [id] });
                suffix = 'Users?query=' + query;
            } else if (id) {
                suffix = 'User/' + id;
            }
            return client({ path: path + suffix }).then(function(response){ return response.entity; });
        }
    },

    Games: {
        get: function(id) {
            return client({ path: path + 'Games/' + id }).then(function(response) { return response.entity; });
        },
        post: function(data) {
            var entity = {},
                mapper = function(input){
                    return input && { _id: input._id, id: input._id, name: input.name };
                };
            entity.title = data.title;
            entity.players = _.compact([mapper(data.player1), mapper(data.player2), mapper(data.player3), mapper(data.player4)]);
            return client({ path: path + 'Games', method: 'POST', entity: entity }).then(function(response){ return response.entity });
        }
    }
};