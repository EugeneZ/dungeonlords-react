var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    Client = require('./component/Client'),
    GamesList = require('./component/GamesList'),
    Game = require('./component/Game'),
    NewGame = require('./component/NewGame');

module.exports = function(){
    return (
        <Route handler={Client}>
            <Route name="game" path="/game/:id" handler={Game}/>
            <Route name="new" handler={NewGame}/>
            <Route name="games" handler={GamesList}/>
            <DefaultRoute handler={GamesList}/>
        </Route>
    );
};