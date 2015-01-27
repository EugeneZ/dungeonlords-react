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
            gameErrors: gameStore.getErrors()
        }
    },

    componentWillMount: function() {
        this.getFlux().actions.game.load(this.props.params.id);
        socket.emit('GetGameActions', { game: this.props.params.id });
    },

    componentWillReceiveProps: function(newProps) {
        socket.emit('GetGameActions',  { game: this.props.params.id });
    },

    render: function () {
        if (!this.state.game && this.state.gameLoading) {
            return <h2>Loading...</h2>;
        } else if (!this.state.game) {
            return <h2>No Game Found</h2>;
        }

        var msgClass = null,
            msg = 'Pick a card';

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
                </div>
            </div>
        );
    }
});