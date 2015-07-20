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
        var gameStore = this.getFlux().store('Game');

        return {
            game: gameStore.getGame(),
            gameLoading: gameStore.isLoading(),
            log: gameStore.getLog(),
            directive: gameStore.getGame() ? gameStore.getGame().getPlayerDirective().component : null,
            props: gameStore.getGame() ? gameStore.getGame().getPlayerDirective().props : null
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
                    <h2>{this.state.game.getTitle()} <small>{this.state.game.getId()}</small></h2>

                    {React.createElement(this.state.directive, this.state.props)}

                    <h4>Game Log</h4>
                    <ol>
                        {this.state.log.map(function(log, i){ return <li key={i}>{log}</li>; })}
                    </ol>
                </div>
            </div>
        );
    }
});