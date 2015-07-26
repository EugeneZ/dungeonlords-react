var React = require('react');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="dungeon">
                {this.props.dungeon.map(function(column){
                    return (
                        <div className="column">
                            {column.map(function(row){
                                return (
                                    <div className="space">
                                        
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }
});