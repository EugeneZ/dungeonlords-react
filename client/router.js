var Router = require('react-router'),
    routes = require('./routes');

module.exports = Router.create({
    routes: routes()
});