var React = require('react'),
    OrderCarc = require('./OrderCard');

module.exports = React.createClass({
    render: function () {
        var instructions = 'Do you want to take this action? If you skip it, your minion will return and you will have the option of taking this order back instead of having it be inaccesssible' +
            ' next round.';
        return (
            <div>
                <div className={'panel panel-primary'}>
                    <div className="panel-heading">{instructions}</div>
                    <div className="panel-body">
                        <div className="selection">
                            <div className="orders">
                                <OrderCard order={this.props.order} active={false}/>
                            </div>
                            <button className="btn btn-danger" onClick={this.onClickSkip} disabled={!this.state.picked.length}>Undo</button>
                            <button className="btn btn-success" onClick={this.onClickOkay} disabled={!this.state.completed}>Okay</button>
                        </div>
                    </div>
                </div>
                <PlayerBoards players={this.props.players} currentPlayer={this.props.currentPlayer}/>
            </div>
        );
    }
});