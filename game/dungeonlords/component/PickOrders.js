var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    OrderCard = require('./OrderCard');

module.exports = React.createClass({
    mixins: [FluxMixin],

    propTypes: {
        mode: React.PropTypes.oneOf(['standard', 'initial', 'dummy']).isRequired, // Determines how many orders the player can choose, and the text in the instructions.
        orders: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
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
        var instructions;

        if (this.props.mode === 'initial') {
            instructions = 'Pick a card that you will keep. The other two will become your first set of inaccessible orders.';
        } else if (this.props.mode === 'dummy') {
            instructions = 'Pick your dummy player\'s third order.';
        } else {
            instructions = 'Pick orders for your minions.';
        }

        return (
            <div className={'panel panel-' + this.state.completed ? 'success' : 'primary'}>
                <div className="panel-heading">{instructions}</div>
                <div className="panel-body">
                    <div className="selection">
                        <div className="orders">
                            {this.props.orders.map(function(order){
                                var index = this.state.picked.indexOf(order);
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
        );
    },

    onClickOrder: function(e, order){
        e.preventDefault();
        if (this.props.mode === 'initial' || this.props.mode === 'dummy') {
            this.setState({
                picked: [order],
                completed: true
            });
        } else if (this.state.picked.length >= 2) {
            this.setState({
                picked: [this.state.picked[0], this.state.picked[1], order],
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
        this.props.onSubmit(this.state.picked);
    },
});