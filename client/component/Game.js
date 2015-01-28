'use strict';

var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    socket = require('../socket');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Game')],

    getStateFromFlux: function() {
        var gameStore = this.getFlux().store('Game');

        return {
            game: gameStore.getGame(),
            gameLoading: gameStore.isLoading(),
            gameErrors: gameStore.getErrors(),
            log: gameStore.getLog()
        }
    },

    componentWillMount: function() {
        this.getFlux().actions.game.load(this.props.params.id);
    },

    render: function () {
        if (!this.state.game && this.state.gameLoading) {
            return <h2>Loading...</h2>;
        } else if (!this.state.game) {
            return <h2>No Game Found</h2>;
        }

        var msgClass = null,
            msg = 'Pick a card';

        var log = this.state.log.map(function(log, i){ return <li key={i}>{log}</li>; });

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>{this.state.game.title} <small>{this.state.game._id}</small></h2>
                    <div className="panel panel-primary">
                        <div className="panel-heading">{msg}</div>
                        <div className="panel-body">
                            CARDS
                        </div>
                    </div>

                    <h4>Game Log</h4>
                    <ol>
                    {log}
                    </ol>
                </div>
            </div>
        );
    }
});