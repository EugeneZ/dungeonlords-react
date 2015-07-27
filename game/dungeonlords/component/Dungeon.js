var React = require('react');

module.exports = React.createClass({
    render: function () {
        var dungeon = this.props.dungeon;
        var highlight = [[],[],[],[],[]];
        if (this.props.highlight) {
            this.props.highlight.forEach(function(area){
                highlight[area.column][area.row] = true;
            });
        }
        return (
            <div className="dungeon">
                {dungeon.map(function(column){
                    return (
                        <div className="column">
                            {column.map(function(row){
                                return (
                                    <div className={'space' + (highlight[column][row] ? ' highlight' : '')} onClick={this.onClick.bind(this, { column: column, row: row })}>
                                        {!dungeon[column][row] ? null : <img className="img-responsive" src={'/assets/images/dungeonlords/room_' + dungeon[column][row] + '.png'}/>}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    },

    onClick: function(location, e){
        e.preventDefault();
        if (this.props.onClick) {
            this.props.onClick(location);
        }
    }
});