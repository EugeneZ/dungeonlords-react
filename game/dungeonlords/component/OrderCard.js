var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Icon = require('../../../client/component/Icon');

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function () {
        var text, icon, size = '2x';
        if (this.props.order === 1) {
            icon = <Icon icon="cutlery" size={size}/>;
            text = 'Get Food';
        } else if (this.props.order === 2) {
            icon = <Icon icon="smile-o" size={size}/>;
            text = 'Reputation';
        } else if (this.props.order === 3) {
            icon = <Icon icon="wrench" size={size}/>;
            text = 'Dig Tunnels';
        } else if (this.props.order === 4) {
            icon = <Icon icon="diamond" size={size}/>;
            text = 'Mine Gold';
        } else if (this.props.order === 5) {
            icon = <Icon icon="child" size={size}/>;
            text = 'Recruit Imps';
        } else if (this.props.order === 6) {
            icon = <Icon icon="bomb" size={size}/>;
            text = 'Buy Traps';
        } else if (this.props.order === 7) {
            icon = <Icon icon="paw" size={size}/>;
            text = 'Hire Monster';
        } else if (this.props.order === 8) {
            icon = <Icon icon="cube" size={size}/>;
            text = 'Build Room';
        } else {
            icon = <Icon icon="question-circle" size={size} spin={true}/>;
        }

        var ordinal = '';
        if (this.props.active) {

            switch (this.props.index) {
                case 0:
                    ordinal = <p>1st</p>;
                    break;
                case 1:
                    ordinal = <p>2nd</p>;
                    break;
                case 2:
                    ordinal = <p>3rd</p>;
                    break;
            }
        }

        return (
            <div className={className + (this.props.active ? ' active' : '')} onClick={this.onClick.bind(this, order)}>
                {icon}
                <span>{text}</span>
                {ordinal}
            </div>
        );
    },

    onClick: function(order, e) {
        if (this.props.onClick) {
            this.props.onClick(e, order);
        }
    }
});