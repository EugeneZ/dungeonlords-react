var React = require('react'),
    Icon = require('../../../client/component/Icon');

module.exports = React.createClass({
    render: function () {
        var waiting = null;

        if (this.props.currentPlayer.isWaiting()) {
            waiting = (
                <div className="waiting">
                    <Icon icon="gear" spin={true} size="5x"/>
                </div>
            );
        }

        var boards = this.props.players.map(function(player){
            return (
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
            );
        });

        return (
            <div>
                {waiting}
                {boards}
            </div>
        );
    }
});