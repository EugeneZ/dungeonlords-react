var passportSocketIo = require('passport.socketio'),
    cookieParser = require('cookie-parser'),
    config = require('config-heroku'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    _ = require('lodash'),
    DLGame = require('./dungeonlords/Game');

module.exports = function(io) {
    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key:         'connect.sid',
        secret:      config.cookie.secret,
        store:       new mongoStore({ mongooseConnection: mongoose.connection })
    }));

    io.on('connection', function (socket) {

        // join the appropriate games/rooms
        socket.on('JoinGame', function(data){
            if (socket.request.user.games.indexOf(data.game) === -1){
                console.log('Unauthorized join room: ' + data.game);
                return socket.emit('GameActions', new Error('Unauthorized game requested'));
            } else {
                socket.join(data.game);
                socket.emit('JoinGameSuccess', { status: true });
            }
        });

        // Get the game's action log.
        socket.on('GetGameActions', function (data) {
            ensureAuthorized(socket, data.game);

            mongoose.model('GameAction').find({ game: data.game }, function(err, actions){

                // filter private values
                _.forEachRight(actions, function(action, i){
                    if (action.isServer()){
                        actions.splice(i, 1);
                    } else if (action.isPrivate() && !action.user.equals(socket.request.user._id)){
                        action.value = null;
                    }
                });

                socket.emit('GameActions', actions);
            });
        });

        // Make a move
        socket.on('PostGameAction', function(data){
            ensureAuthorized(socket, data.game);
            var game = new DLGame(data.game);
            game.move(socket.request.user, data.move);
        });

    });

    function ensureAuthorized(socket, game){
        if (socket.rooms.indexOf(game) === -1){
            console.log('Unauthorized error for game: ' + game);
            throw new Error('Unauthorized game');
        }
    }
};