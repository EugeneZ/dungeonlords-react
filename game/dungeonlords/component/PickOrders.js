var React = require('react'),
    OrderCard = require('./OrderCard'),
    PlayerBoards = require('./PlayerBoards');

module.exports = React.createClass({
    propTypes: {
        mode: React.PropTypes.oneOf(['standard', 'initial', 'dummy']).isRequired, // Determines how many orders the player can choose, and the text in the instructions.
        orders: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
        dummyOrders: React.PropTypes.arrayOf(React.PropTypes.number),
        onSubmit: React.PropTypes.func.isRequired
    },

    getDefaultProps: function(){
        return {
            mode: 'standard'
        };
    },

    getInitialState: function(){
        return {
            completed: false,
            picked: []
        };
    },

    render: function () {
        var instructions,
            orders = this.props.orders;

        if (this.props.mode === 'initial') {
            instructions = 'Pick a card that you will keep. The other two will become your first set of inaccessible orders.';
        } else if (this.props.mode === 'dummy' && this.state.picked.length >= 3) {
            instructions = 'Pick your dummy player\'s third order.';
            orders = this.props.dummyOrders;
        } else {
            instructions = 'Pick orders for your minions.';
        }

        return (
            <div>
                <div className={'panel panel-' + (this.state.completed ? 'success' : 'primary')}>
                    <div className="panel-heading">{instructions}</div>
                    <div className="panel-body">
                        <div className="selection">
                            <div className="orders">
                                {orders.map(function(order){
                                    var index = orders === this.props.dummyOrders ? -1 : this.state.picked.indexOf(order);
                                    return (
                                        <OrderCard order={order} active={index !== -1} index={index} onClick={this.onClickOrder}/>
                                    );
                                }.bind(this))}
                            </div>
                            <button className="btn btn-danger" onClick={this.onClickUndo} disabled={!this.state.picked.length}>Undo</button>
                            <button className="btn btn-success" onClick={this.onClickOkay} disabled={!this.state.completed}>Okay</button>
                        </div>
                    </div>
                </div>
                <PlayerBoards players={this.props.players} currentPlayer={this.props.currentPlayer}/>
            </div>
        );
    },

    onClickOrder: function(e, order){
        e.preventDefault();
        if (this.props.mode === 'initial') {
            this.setState({
                picked: [order],
                completed: true
            });
        } else if ((this.state.picked.length >= 2 && this.props.mode !== 'dummy') || (this.state.picked.length >= 3 && this.props.mode === 'dummy')) {
            this.setState({
                picked: this.state.picked.slice(0, this.props.mode === 'dummy' ? 3 : 2).concat(order),
                completed: true
            });
        } else {
            this.setState({
                picked: this.state.picked.concat([order]),
                completed: false
            })
        }
    },

    onClickUndo: function(e){
        e.preventDefault();
        this.setState({
            picked: [],
            completed: false
        });
    },

    onClickOkay: function(e){
        e.preventDefault();

        if (this.props.mode === 'dummy') {
            this.props.onSubmit(this.state.picked.slice(0, 3), this.state.picked.slice(3)[0]);
        } else {
            this.props.onSubmit(this.state.picked);
        }
    }
});