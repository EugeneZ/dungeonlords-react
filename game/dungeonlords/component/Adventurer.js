var React = require('react'),
    Icon = require('../../../client/component/Icon'),
    Adventurer = require('../../../game/dungeonlords/Adventurer'),
    _ = require('lodash');

module.exports = React.createClass({
    render: function () {
        var icons,
            name,
            type = Adventurer[this.props.adventurer].type,
            difficulty = Adventurer[this.props.adventurer].difficulty,
            health = Adventurer[this.props.adventurer].health,
            power = Adventurer[this.props.adventurer].power;

        if (type === Adventurer.Type.Fighter) {
            name = 'Fighter';
            icons = <Icon icon="long-arrow-right"/>;
        } else if (type === Adventurer.Type.Cleric) {
            name = 'Cleric';
            icons = [<Icon icon="heart"/>];
        } else if (type === Adventurer.Type.Thief) {
            name = 'Thief';
            icons = [<Icon icon="wrench"/>];
        } else {
            name = 'Wizard';
            icons = [<Icon icon="bolt"/>];
        }

        if (type !== Adventurer.Type.Fighter && power > 1) {
            _.fill(icons, icons[0], 1, power);
        }

        return (
            <div className={'adventurer adventurer_' + this.props.adventurer}>
                <span className="health">{health}</span>
                <span className="name">{name} {difficulty}</span>
                <span className="power">
                    {icons}
                </span>
            </div>
        );
    }
});