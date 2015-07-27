var React = require('react'),
    Dungeon = require('./Dungeon'),
    Monster = require('../Monster');

module.exports = React.createClass({

    getInitialState: function() {
        var order = this.props.order,
            noActionNecessary = order !== 3 && order !== 4 && order !== 7 && order !== 8 && !(order === 2 && this.props.placement !== 1);
        return {
            needDecision: !noActionNecessary,
            completed: noActionNecessary,
            dirty: false,
            value: null
        }
    },

    render: function () {
        var instructions = 'Do you want to take this action? If you skip it, your minion will return and you will have the option of taking this order back instead of having it be inaccesssible' +
            ' next round.';

        if (this.props.order === 2 && this.props.placement !== 1) {
            instructions += ' If you do not skip it, you must also select which of the combat cards you will see.';
        } else if (this.props.order === 3) {
            instructions += ' If you do not skip it, you must also select the spaces on your dungeon where you will build tunnels (spending an imp for each one).';
        } else if (this.props.order === 4) {
            instructions += ' If you do not skip it, you must also select the number of imps you will spend mining gold.';
        } else if (this.props.order === 7) {
            instructions += ' If you do not skip it, you must also select the monster you wish to hire and pay its cost.';
        } else if (this.props.order === 8) {
            instructions += ' If you do not skip it, you must also select the room you wish to build, and where in your dungeon you wish to build it.';
        }

        var undoButton = null,
            valuePanel = null;
        if (this.state.needDecision) {
            undoButton = <button className="btn btn-danger" onClick={this.onClickUndo} disabled={!this.state.dirty}>Undo</button>;
            if (this.props.order === 2 && this.props.placement !== 1) {
                valuePanel = this.renderCombatCardPicker();
            } else if (this.props.order === 3) {
                valuePanel = this.renderTunnelBuilder();
            } else if (this.props.order === 4) {
                valuePanel = this.renderMining();
            } else if (this.props.order === 7) {
                valuePanel = this.renderMonsterPicker();
            } else if (this.props.order === 8) {
                valuePanel = this.renderRoomBuilder();
            }
        }

        return (
            <div>
                <div className={'panel panel-primary'}>
                    <div className="panel-heading">{instructions}</div>
                    <div className="panel-body">
                        <div className="selection">
                            <div className="area">
                                <div className={'shade shade-' + this.props.placement}/>
                                <img src={'/assets/iamges/dungeonlords/area_' + (this.props.order - 1) + '.png'}/>
                            </div>
                            {valuePanel}
                            <button className="btn btn-danger" onClick={this.onClickSkip}>Skip</button>
                            {undoButton}
                            <button className="btn btn-success" onClick={this.onClickOkay} disabled={!this.state.completed}>Okay</button>
                        </div>
                    </div>
                </div>
                <PlayerBoards players={this.props.players} currentPlayer={this.props.currentPlayer}/>
            </div>
        );
    },

    onClickSkip: function(e){
        e.preventDefault();
        this.onSubmit(false);
    },

    onClickUndo: function(e){
        e.preventDefault();
        this.setState(this.getInitialState());
    },

    onClickOkay: function(e){
        e.preventDefault();
        this.onSubmit(this.state.value);
    },

    renderCombatCardPicker: function(){
        return (
            <div>
                <button className="btn btn-info" onClick={this.onClickCombatCard.bind(0)} disabled={this.state.value === 0}>First</button>
                <button className="btn btn-info" onClick={this.onClickCombatCard.bind(1)} disabled={this.state.value === 1}>Second</button>
                <button className="btn btn-info" onClick={this.onClickCombatCard.bind(2)} disabled={this.state.value === 2}>Third</button>
                <button className="btn btn-info" onClick={this.onClickCombatCard.bind(3)} disabled={this.state.value === 3}>Fourth</button>
            </div>
        );
    },

    onClickCombatCard: function(card, e) {
        e.preventDefault();
        this.setState({ value: card, completed: true, dirty: true });
    },

    renderTunnelBuilder: function(){
        // Modify the player's dungeon temporarily with the tunnels they have built so far
        var dungeon = this.props.currentPlayer.getDungeon();
        if (this.state.value) {
            this.state.value.forEach(function(change){
                dungeon[change.column][change.row] = 1;
            });
        }

        var highlight = this.props.currentPlayer.getBuildableSpaces(dungeon);

        return <Dungeon dungeon={dungeon} highlight={highlight} onClick={this.onClickBuildTunnel}/>
    },

    onClickBuildTunnel: function(location) {
        var value = this.state.value || [];
        var numberOfAvailableImps = this.props.currentPlayer.getImps() - this.props.currentPlayer.getUsedImps();

        // If this is the third placement, you must use a foreman so your maximum imps is lowered by 1
        if (value.length && this.props.placement === 2) {
            numberOfAvailableImps--; // foreman
        }

        // figure out how many imps we have before this operation. If its zero, then this click is just overwriting the last placed tunnel, otherwise it uses an imp
        numberOfAvailableImps -= value.length;
        if (numberOfAvailableImps) {
            value.push(location);
        } else {
            value[value.length - 1] = location;
        }

        this.setState({
            value: value,
            completed: true,
            dirty: true
        });
    },

    renderMining: function(){
        var numberOfAvailableImps = this.props.currentPlayer.getImps() - this.props.currentPlayer.getUsedImps(),
            numberOfAvailableTiles = 0,
            dungeon = this.props.currentPlayer.getDungeon(),
            realLimit = this.props.placement === 2 ? numberOfAvailableImps - 1 : numberOfAvailableImps; // subtract an imp for the foreman if this is the third slot

        // Figure out how many unconquered dungeon tiles the player has
        dungeon.forEach(function(column){
            dungeon[column].forEach(function(row){
                if (dungeon[column][row] === 1 || dungeon[column][row] >= 4){
                    numberOfAvailableTiles++;
                }
            });
        });

        // You can only mine if you have enough imps AND unconquered dungeon tiles, use whichever is lower
        if (numberOfAvailableTiles < realLimit) {
            realLimit = numberOfAvailableTiles;
        }

        // We will render our choices for the player as buttons depending on what the limit to what they can mine is
        var buttons = [];
        _.times(realLimit, function(i){
            // do not render a button if this is the third placement -- that's the foreman assignment
            if (this.props.placement === 2 && i === 0) {
                return;
            }
            buttons.push(<button className="btn btn-info" onClick={this.onClickSendImpsToMine.bind(this, i+1)} disabled={this.state.value === i+1}>Mine gold using {i+1} imps</button>);
        }.bind(this));

        return buttons;
    },

    onClickSendImpsToMine: function(numberOfMiningImps){
        this.setState({
            value: numberOfMiningImps,
            completed: true,
            dirty: true
        });
    },

    renderMonsterPicker: function(){
        var monstersAvailable = this.props.tilesOnOffer.monsters,
            monstersPlayerCanAfford = [];

        monstersAvailable.forEach(function(monster){
            if (this.props.currentPlayer.checkCost(Monster[monster].cost)) {
                monstersPlayerCanAfford.push(monster);
            }
        }.bind(this));

        // If the player has already selected the demon, they must also select which of their monsters to sacrifice to it
        var monstersToSacrifice = null;
        if (this.state.value.monster === Monster.Enum.DEMON) {
            monstersToSacrifice = (
                <p>You must now select a monster to sacrifice to the demon:
                    {this.props.currentPlayer.getMonsters().map(function(monster){
                        return <img className={'img-responsive' + (this.state.value.sacrifice === monster ? ' img-thumbnail' : '')}
                                    src={'/assets/images/dungeonlords/monster_' + monster + '.png'}
                                    onClick={this.onClickMonsterToSacrifice.bind(this, monster)}/>
                    })}
                </p>
            );
        }

        return (
            <div className="monsters">
                {monstersPlayerCanAfford.map(function(monster){
                    return <img className={'img-responsive' + (this.state.value.monster === monster ? ' img-thumbnail' : '')}
                                src={'/assets/images/dungeonlords/monster_' + monster + '.png'}
                                onClick={this.onClickMonsterToHire.bind(this, monster)}/>
                })}
            </div>
        );
    },

    onClickMonsterToHire: function(monster, e) {
        e.preventDefault();
        this.setState({
            value: { monster: monster },
            completed: monster !== Monster.Enum.DEMON, // not complete if player picked the demon... they must also sacrifice something
            dirty: true
        });
    },

    onClickMonsterToSacrifice: function(monster, e) {
        e.preventDefault();
        this.setState({
            value: { monster: Monster.Enum.DEMON, sacrifice: monster },
            completed: true
        });
    },

    renderRoomBuilder: function(){
        // This is a two-step process: the player must first pick the room they wish to build, then the location they can build it. TODO: If there is only one room available, we should skip the
        // first step
        var currentPlayer = this.props.currentPlayer,
            roomsAvailable = this.props.tilesOnOffer.rooms,
            roomsLegalToBuild = [],
            dungeon = currentPlayer.getDungeon(),
            value = this.state.value;

        if (value === null) {
            roomsAvailable.forEach(function(room){
                if (currentPlayer.getBuildableSpaces(dungeon, [room]).length){
                    roomsLegalToBuild.push(room);
                }
            }.bind(this));

            return (
                <div className="rooms">
                    {roomsLegalToBuild.map(function(room){
                        return <img className="img-responsive"
                                    src={'/assets/images/dungeonlords/room_' + room + '.png'}
                                    onClick={this.onClickSelectRoom.bind(this, room)}/>;
                    })}
                </div>
            );
        }

        // Modify the player's dungeon temporarily with the room they have built (if they have already done so)
        if (this.state.value.location) {
            dungeon[this.state.value.location.column][this.state.value.location.row] = value.room;
        }

        var highlight = currentPlayer.getBuildableSpaces(dungeon, [this.state.value.room]);

        return <Dungeon dungeon={dungeon} highlight={highlight} onClick={this.onClickBuildRoom}/>
    },

    onClickSelectRoom: function(room, e){
        e.preventDefault();
        this.setState({
            value: { room: room },
            dirty: true
        });
    },

    onClickBuildRoom: function(location){
        this.setState({
            value: { room: room, location: location },
            completed: true
        });
    }
});