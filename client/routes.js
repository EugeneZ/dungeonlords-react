var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    Client = require('./component/Client'),
    GamesList = require('./component/GamesList');

module.exports = function(){
    return (
        <Route handler={Client}>
            <DefaultRoute handler={GamesList}/>
        </Route>
    );
};