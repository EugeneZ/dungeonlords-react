'use strict';

var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin;

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Users')],
    getStateFromFlux: function() {
        var usersStore = this.getFlux().store('Users');

        return {
            users: usersStore.getUsers()
        };
    },
    componentWillMount: function(){
        this.getFlux().actions.newGame.load();
    },
    render: function () {
        return (
            <div className="row">
                <div className="col-sm-8">
                    <h2>New Game</h2>
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label className="control-label col-sm-4" for="title">Title</label>
                            <div className="col-sm-6">
                                <input className="form-control" id="title" defaultValue=""/>
                            </div>
                        </div>
                        {this.renderPlayerSelect(1)}
                        {this.renderPlayerSelect(2)}
                        <div className="form-group">
                            <div className="col-sm-6 col-sm-offset-4">
                                <button type="submit" className="btn btn-primary">Start New Game</button>
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
                <label className="control-label col-sm-4" for={'player' + i}>Player {'#' + i}</label>
                <div className="col-sm-6">
                    <select className="form-control" id={'player' + i}>
                        {users}
                    </select>
                </div>
            </div>
        );
    }
});