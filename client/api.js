var rest = require('rest'),
    mime = require('rest/interceptor/mime'),
    client = rest.wrap(mime),
    path = '/api/v1/';

module.exports = {
    Users: {
        get: function(){
            return client({ path: path + 'Users' }).then(function(response){ return response.entity; });
        }
    }
};