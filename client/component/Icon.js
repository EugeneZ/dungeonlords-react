var React = require('react'),
    _ = require('lodash');

module.exports = React.createClass({
    render: function(){
        var className = "fa fa-fw fa-";
        className += this.props.icon;

        if (this.props.size) {
            className += " fa-" + this.props.size;
        }

        if (this.props.spin) {
            className += " fa-spin";
        }

        return (
            <i {...this.props} className={className} aria-hidden="true"></i>
        );
    }
});