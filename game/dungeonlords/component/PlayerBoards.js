var React = require('react'),
    Icon = require('../../../client/component/Icon');

module.exports = React.createClass({

    getInitialState: function(){
        return {
            active: this.props.currentPlayer
        };
    },

    render: function () {
        var waiting = null,
            player = this.state.active;

        if (this.props.currentPlayer.isWaiting()) {
            waiting = (
                <div className="waiting">
                    <Icon icon="gear" spin={true} size="5x"/>
                </div>
            );
        }

        return (
            <div>
                {waiting}
                <ul className="nav nav-tabs">
                    {this.props.players.map(function(player){
                        return (
                            <li role="presentation" className={this.state.active.getId() === player.getId() ? 'active' : ''}>
                                <a href="#" onClick={this.onClickTab.bind(this, player)}>{player.getName()}</a>
                            </li>
                        );
                    }.bind(this))}
                </ul>
                <div>
                    <ul className="list-group">
                        <li className="list-group-item active">
                            {player.getName()}
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.getGold()}</span>
                            Gold
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.getFood()}</span>
                            Food
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.getImps()}</span>
                            Imps
                        </li>
                    </ul>
                </div>
            </div>
        );
    },

    onClickTab: function(player, e) {
        e.preventDefault();
        this.setState({ active: player });
    }

});