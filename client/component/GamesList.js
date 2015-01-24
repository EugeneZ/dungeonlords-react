'use strict';

var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    NewGame = require('./NewGame');

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function () {
        if (true) {
            return <NewGame/>
        }
        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>Games</h2>
                </div>
            </div>
        );
    }
});