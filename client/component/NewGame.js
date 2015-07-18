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
            player1: user
        };
    },
    getInitialState: function(){
        return {
            player2: null,
            player3: null,
            player4: null,
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
                        {this.state.player2 !== null ? this.renderPlayerSelect(3) : null}
                        {this.state.player3 !== null ? this.renderPlayerSelect(4) : null}
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

        var id = 'player' + i;

        return (
            <div className="form-group">
                <label className="control-label col-sm-4" htmlFor={id}>{i > 2 ? 'Optional ' : ''}Player {'#' + i}</label>
                <div className="col-sm-6">
                    <select className="form-control" id={id} value={this.state[id] ? this.state[id].id : 0} onChange={this.onChangePlayer.bind(this, i)}>
                        <option key="-1" value={0}>Select Player</option>
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

        if (!this.state.player1) {
            return this.setState({ error: 'Player #1 is required' });
        }

        if (!this.state.player2) {
            return this.setState({ error: 'Player #2 is required' });
        }

        var realPlayers = 0;
        var duplicates = _.uniq([1,2,3,4].map(function(i){
            var player = this.state['player' + i];
            if (player) {
                realPlayers++;
            }
            return player;
        }.bind(this)));

        if (_.compact(duplicates).length !== realPlayers) {
            return this.setState({ error: 'All players must be different' });
        }

        this.setState({ error: false });
    },

    onChangeTitle: function(e) {
        this.setState({ title: e.target.value, dirty: true }, this.validate);
    },

    onChangePlayer: function(i, e) {
        var state = { dirty: true };
        state['player' + i] = _.find(this.state.users, {_id: e.target.value});
        this.setState(state, this.validate);
    },

    onSubmit: function(e) {
        e.preventDefault();
        this.getFlux().actions.game.newGame(_.clone(this.state));
    }
});