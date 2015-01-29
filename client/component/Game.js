'use strict';

var _ = require('lodash'),
    React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Game = require('../../server/dungeonlords/Game'),
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
            gameErrors: gameStore.getErrors(),
            log: gameStore.getLog(),
            logic: gameStore.getLogic(),
            move: gameStore.getMove(),
            me: userStore.getLoggedInUser()
        }
    },

    getInitialState: function(){
        return {
            active: 0
        };
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

        var instructions = this.getInstructions();

        var log = this.state.log.map(function(log, i){ return <li key={i}>{log}</li>; });

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>{this.state.game.title} <small>{this.state.game._id}</small></h2>
                    <div className={'panel panel-' + instructions.className}>
                        <div className="panel-heading">{instructions.message}</div>
                        <div className="panel-body">
                            {instructions.selection}
                        </div>
                    </div>

                    {this.renderLogic()}

                    <h4>Game Log</h4>
                    <ol>
                    {log}
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
    },

    renderOrders: function(orders){
        var size = '5x';

        orders = orders.map(function(order){
            var text, icon;
            if (order === 1) {
                icon = <Icon icon="cutlery" size={size}/>;
                text = 'Get Food';
            } else if (order === 2) {
                icon = <Icon icon="smile-o" size={size}/>;
                text = 'Reputation';
            } else if (order === 3) {
                icon = <Icon icon="wrench" size={size}/>;
                text = 'Dig Tunnels';
            } else if (order === 4) {
                icon = <Icon icon="diamond" size={size}/>;
                text = 'Mine Gold';
            } else if (order === 5) {
                icon = <Icon icon="child" size={size}/>;
                text = 'Recruit Imps';
            } else if (order === 6) {
                icon = <Icon icon="bomb" size={size}/>;
                text = 'Buy Traps';
            } else if (order === 7) {
                icon = <Icon icon="paw" size={size}/>;
                text = 'Hire Monster';
            } else if (order === 8) {
                icon = <Icon icon="cube" size={size}/>;
                text = 'Build Room';
            } else {
                icon = <Icon icon="question-circle" size={size} spin={true}/>;
            }

            return <div className={'order' + (this.state.active === order ? ' active' : '')} onClick={this.onClickOrder.bind(this, order)}>
                {icon}
                <span>{text}</span>
            </div>;
        }.bind(this));

        return (
            <div className="selection">
                <div className="orders">
                    {orders}
                </div>
                <button className="btn btn-danger" onClick={this.onClickUndo}>Undo</button>
                <button className="btn btn-success" onClick={this.onClickOkay} disabled={this.state.active === 0}>Okay</button>
            </div>
        );
    },

    getInstructions: function(){
        var className = '',
            message = '',
            selection = <Icon icon="cog" size="5x" spin={true}/>;

        if (this.state.move === Game.Move.WAITING_FOR_SERVER) {
            className = 'info';
            message = 'Waiting for the server to finish processing';
        } else if (this.state.move === Game.Move.WAITING_FOR_OTHERS) {
            className = 'info';
            message = 'Waiting for other players to finish their turns';
        } else if (this.state.move === Game.Move.SELECT_INITIAL_ORDERS) {
            className = 'warning';
            message = 'The game has begun! Select an order to keep. The other two will be your first set of inaccessible orders.';
            selection = this.renderOrders(this.state.logic.lookupPlayer[this.state.me._id].initial);
        } else if (this.state.move === Game.Move.SELECT_ORDERS) {
            className = 'warning';
            message = 'Select your orders for your minions.';
            selection = this.renderOrders(this.state.logic.lookupPlayer[this.state.me._id].orders);
        } else {
            className = 'danger';
            message = 'Something went wrong.'
        }

        return { className: className, message: message, selection: selection };
    },

    onClickOrder: function(order, e) {
        e.preventDefault();
        this.setState({ active: order });
    },

    onClickUndo: function(e) {
        e.preventDefault();
        this.setState(this.getInitialState());
    },

    onClickOkay: function(e) {
        e.preventDefault();
        this.getFlux().actions.game.makeMove(_.cloneDeep(this.state));
    }
});