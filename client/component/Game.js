var _ = require('lodash'),
    React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Game = require('../../game/dungeonlords/Game'),
    Icon = require('./Icon');

require('../less/dungeonlords.less');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Game', 'Users')],

    getStateFromFlux: function() {
        var gameStore = this.getFlux().store('Game'),
            userStore = this.getFlux().store('Users');

        return {
            game: gameStore.getGame(),
            gameLoading: gameStore.isLoading(),
            log: gameStore.getLog(),
            logic: gameStore.getLogic()
        }
    },

    componentWillMount: function() {
        this.getFlux().actions.game.load(this.props.params.id);
        this.getFlux().actions.users.getUsersForGame(this.props.params.id);
    },

    render: function () {
        if (!this.state.game && this.state.gameLoading) {
            return <h2>Loading...</h2>;
        } else if (!this.state.game) {
            return <h2>No Game Found</h2>;
        }

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>{this.state.game.title} <small>{this.state.game._id}</small></h2>



                    {this.renderLogic()}

                    <h4>Game Log</h4>
                    <ol>
                        {this.state.log.map(function(log, i){ return <li key={i}>{log}</li>; })}
                    </ol>
                </div>
            </div>
        );
    },

    renderLogic: function(){
        if (!this.state.logic) {
            return '';
        }

        var boards = this.state.logic.players.map(function(player){
            return (
                <div>
                    <ul className="list-group">
                        <li className="list-group-item active">
                            {player._id}
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.gold}</span>
                            Gold
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.food}</span>
                            Food
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.imps}</span>
                            Imps
                        </li>
                    </ul>
                </div>
            );
        });

        return (
            <div>
            {boards}
            </div>
        );
    }
});