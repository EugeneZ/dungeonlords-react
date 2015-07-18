var React = require('react'),
    Flux = require('fluxxor').Flux,
    _ = require('lodash'),
    router = require('./router');

var stores = {
    Users: new (require('./store/Users')),
    Game: new (require('./store/Game')),
    Games: new (require('./store/Games'))
};

var actions = {
    game: require('./action/game'),
    users: require('./action/users')
};

var flux = new Flux(stores, actions);

if (process.env.NODE_ENV === 'development') {
    flux.on('dispatch', function (type, payload) {
        console.log('[Dispatch]', type, payload);
    });
}

router.run(function(Handler, state){
    React.render(<Handler params={state.params} flux={flux}/>, document.getElementById('client'));
});
