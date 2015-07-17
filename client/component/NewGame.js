'use strict';

var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    _ = require('lodash');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Users')],
    getStateFromFlux: function() {
        var usersStore = this.getFlux().store('Users'),
            user = usersStore.getLoggedInUser();

        return {
            users: usersStore.getUsers(),
            usersLoading : usersStore.isLoading(),
            title: user ? user.name + '\'s Game' : '',
            player1: user ? user._id : -1
        };
    },
    getInitialState: function(){
        return {
            player2: -2,
            player3: -3,
            player4: -4,
            error: false,
            dirty: false
        };
    },
    componentWillMount: function(){
        this.getFlux().actions.users.getAll();
        this.validate();
    },

    componentWillReceiveProps: function(){
        this.validate();
    },

    render: function () {
        return (
            <div className="row">
                <div className="col-sm-8">
                    <div className="row">
                        <h2 className="col-sm-6 col-sm-offset-4">New Game</h2>
                    </div>
                    <form className="form-horizontal" onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <label className="control-label col-sm-4" htmlFor="title">Title</label>
                            <div className="col-sm-6">
                                <input className="form-control" id="title" value={this.state.title} onChange={this.onChangeTitle}/>
                            </div>
                        </div>
                        {this.renderPlayerSelect(1)}
                        {this.renderPlayerSelect(2)}
                        {parseInt(this.state.player2) !== -2 ? this.renderPlayerSelect(3) : null}
                        {parseInt(this.state.player3) !== -3 ? this.renderPlayerSelect(4) : null}
                        <div className="form-group">
                            <div className="col-sm-6 col-sm-offset-4">
                                <button type="submit" className="btn btn-primary" disabled={this.state.error}>
                                    {this.state.usersLoading ? 'Please wait...' : this.state.dirty && this.state.error ? this.state.error : 'Start New Game'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    },

    renderPlayerSelect: function(i) {
        var users = this.state.users.map(function(user){
            return <option key={user._id} value={user._id}>{user.name}</option>;
        });

        return (
            <div className="form-group">
                <label className="control-label col-sm-4" htmlFor={'player' + i}>{i > 2 ? 'Optional ' : ''}Player {'#' + i}</label>
                <div className="col-sm-6">
                    <select className="form-control" id={'player' + i} value={this.state['player' + i]} onChange={this.onChangePlayer.bind(this, i)}>
                        <option key="-1" value={-(i)}>Select Player</option>
                        {users}
                    </select>
                </div>
            </div>
        );
    },

    validate: function() {
        if (!this.state.title.length) {
            return this.setState({ error: 'You must enter a title' });
        }

        if (parseInt(this.state.player1) === -1) {
            return this.setState({ error: 'Player #1 is required' });
        }

        if (parseInt(this.state.player2) === -2) {
            return this.setState({ error: 'Player #2 is required' });
        }

        var duplicates = _.uniq([1,2,3,4].map(function(i){
            return this.state['player' + i];
        }.bind(this))).length !== 4;

        if (duplicates) {
            return this.setState({ error: 'All players must be different' });
        }

        this.setState({ error: false });
    },

    onChangeTitle: function(e) {
        this.setState({ title: e.target.value, dirty: true }, this.validate);
    },

    onChangePlayer: function(i, e) {
        var state = { dirty: true };
        state['player' + i] = e.target.value;
        this.setState(state, this.validate);
    },

    onSubmit: function(e) {
        e.preventDefault();
        this.getFlux().actions.game.newGame(_.clone(this.state));
    }
});