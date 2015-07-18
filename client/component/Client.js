var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    RouteHandler = require('react-router').RouteHandler;

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function () {
        return <RouteHandler {...this.props}/>;
    }
});