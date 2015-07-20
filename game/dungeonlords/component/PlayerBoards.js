var React = require('react'),
    Icon = require('../../../client/component/Icon'),
    Adventurer = require('./Adventurer'),
    OrderCard = require('./OrderCard');

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

                <div className="playerBoard container-fluid">

                    <div className="row">
                        <div className="col-sm-4 adventurerHolder">
                            {[2,1,0].map(function(slot){
                                var adventurers = player.getAdventurers();
                                if (adventurers.length >= slot + 1) {
                                    return <Adventurer adventurer={adventurers[slot]}/>;
                                } else {
                                    return <div className="adventurer empty"/>;
                                }
                            })}
                            {player.hasPaladin() ? <Adventurer adventurer={'todo'}/> : <div className='adventurer paladin empty'/> /* TODO add paladin support */}
                        </div>

                        <div className="col-sm-2 activeCombatTiles">
                        </div>

                        <div className="col-sm-6 monsterDen">

                        </div>
                    </div>

                    <div className="row">

                        <div className="col-sm-6 dungeon">
                        </div>

                        <div className="col-sm-6">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="row">
                                        <div className="col-sm-6 location location_food">
                                            <span className="locationName">Food</span>
                                            <span className="locationAmount">{player.getFood()}</span>
                                        </div>
                                        <div className="col-sm-6 location location_gold">
                                            <span className="locationName">Gold</span>
                                            <span className="locationAmount">{player.getGold()}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6 location location_imps">
                                            <span className="locationName">Imps</span>
                                            <span className="locationAmount">{player.getImps()}</span>
                                        </div>
                                        <div className="col-sm-6 location location_prison">
                                            <span className="locationName">Prison</span>
                                            <span className="locationAmount">{player.getPrisoners().length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="row">
                                        <div className="col-sm-10 minionOffice">
                                        </div>
                                        <div className="col-sm-2 deadLetterOffice">
                                            {player.countDeadLetters()}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12 heldOrders">
                                            <div className="pull-right">
                                                {player.getHeldOrders().map(function(order){
                                                    return <OrderCard order={order}/>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 playedOrders">
                                    <div className="pull-right">
                                        {player.getOrders().map(function(order){
                                            return <OrderCard order={order}/>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    onClickTab: function(player, e) {
        e.preventDefault();
        this.setState({ active: player });
    }

});