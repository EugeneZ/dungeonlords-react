'use strict';

var React = require('react'),
    Flux = require('fluxxor').Flux,
    Router = require('react-router'),
    routes = require('./routes'),
    _ = require('lodash');

var stores = {
    Users: new (require('./store/Users'))
};

var actions = {
    newGame: require('./action/newGame')
};

var flux = new Flux(stores, actions);

if (process.env.NODE_ENV === 'development') {
    flux.on('dispatch', function (type, payload) {
        console.log('[Dispatch]', type, payload);
    });
}

Router.run(routes(flux), function(Handler, state){
    React.render(<Handler params={state.params} flux={flux}/>, document.getElementById('client'));
});
