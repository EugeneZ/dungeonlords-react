var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Link = require('react-router').Link,
    NewGame = require('./NewGame');

module.exports = React.createClass({
    mixins: [FluxMixin],
    getInitialState: function(){
        var userStore = this.getFlux().store('Users');

        return {
            me: userStore.getLoggedInUser()
        };
    },
    render: function () {
        if (!this.state.me.games || !this.state.me.games.length) {
            return <NewGame/>
        }

        var games = this.state.me.games.map(function(game){
            return (
                <tr>
                    <td><Link to={'/game/' + game}>{game}</Link></td>
                </tr>
            );
        });

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>Games</h2>
                    <table className="table">
                        <tbody>
                            {games}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});