var React = require('react'),
    OrderCarc = require('./OrderCard');

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
        this.setState({ value: card, completed: true });
    },

    renderTunnelBuilder: function(){

    },

    renderMining: function(){

    },

    renderMonsterPicker: function(){

    },

    renderRoomBuilder: function(){

    }
});