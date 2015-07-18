var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Link = require('react-router').Link,
    NewGame = require('./NewGame');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Games')],
    getStateFromFlux: function(){
        var gamesStore = this.getFlux().store('Games');

        return {
            games: gamesStore.getMyGames()
        };
    },
    render: function () {
        if (!this.state.games || !this.state.games.length) {
            return <NewGame/>
        }

        var games = this.state.games.map(function(game){
            return (
                <tr>
                    <td><Link to={'/game/' + game._id}>{game.title}</Link> <small>{game._id}</small></td>
                    <td>{game.lastPlayed}</td>
                    <td>
                        {game.players.map(function(player){
                            return <p>{player.name}</p>;
                        })}
                    </td>
                </tr>
            );
        });

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>Games</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Last Move</th>
                                <th>Players</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});