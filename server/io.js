var passportSocketIo = require('passport.socketio'),
    cookieParser = require('cookie-parser'),
    config = require('config-heroku'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    _ = require('lodash'),
    DLServer = require('./game/dungeonlords/Server');

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
            if (!_.find(socket.request.user.games, function(game){ return game.id = data.game })){
                console.log('Unauthorized join room: ' + data.game);
                return socket.emit('Error', new Error('Unauthorized game requested'));
            } else {
                socket.join(data.game);
                socket.emit('JoinGameSuccess', { status: true });
                console.log('Emitting JoinGameSuccess');
                DLServer.joinGameSetup(data.game, socket.request.user._id, function(actionOrActions){
                    console.log('Emitting GameAction on join');
                    io.to(data.game).emit('GameAction', actionOrActions);
                }, function(err){
                    console.log('Emitting Error: ', err);
                    socket.emit('Error', err);
                });
            }
        });

        // Get the game's action log.
        socket.on('GetGameActions', function (data) {
            ensureAuthorized(socket, data.game);

            DLServer.getMoves(data.game, function(actions){
                console.log('Emitting GameActions');
                socket.emit('GameActions', actions);
            }, function(err){
                console.log('Emitting GameAction');
                socket.emit('Error', err);
            });
        });

        // Make a move
        socket.on('PostGameAction', function(data){
            ensureAuthorized(socket, data.game);
            DLServer.move(data.game, socket.request.user._id, data.value, function(actionOrActions){
                if ('length' in actionOrActions) {
                    console.log('Emitting GameActions after move');
                    io.to(data.game).emit('GameActions', actionOrActions);
                } else {
                    console.log('Emitting GameAction after move');
                    io.to(data.game).emit('GameAction', actionOrActions);
                }
            }, function(err){
                socket.emit('Error', new Error(err));
            });
        });

    });

    function ensureAuthorized(socket, game){
        if (socket.rooms.indexOf(game) === -1){
            console.log('Unauthorized error for game: ' + game);
            throw new Error('Unauthorized game');
        }
    }
};