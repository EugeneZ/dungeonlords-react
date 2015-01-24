var React = require('react'),
    Template = require('./template');

module.exports = React.createClass({
    render: function(){
        return (
            <Template title={this.props.title} user={this.props.isAuthenticated ? this.props.user : null}>
                <div className="row">
                    <div className="col-sm-12">
                        <h1>Error</h1>
                        <p className="lead">Something went wrong.</p>
                        <p>Contact me: eugene.zar@gmail.com and let me know what you did that caused this so I can fix it.</p>
                    </div>
                </div>
            </Template>
        );
    }
});