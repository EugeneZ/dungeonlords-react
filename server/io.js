var passportSocketIo = require('passport.socketio'),
    cookieParser = require('cookie-parser'),
    config = require('config-heroku'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session);

module.exports = function(io) {
    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key:         'connect.sid',
        secret:      config.cookie.secret,
        store:       new mongoStore({ mongooseConnection: mongoose.connection })
    }));

    io.on('connection', function (socket) {
        socket.on('GetGameActions', function (data) {
            mongoose.model('GameAction').find({ game: data.game }, function(err, actions){
                socket.emit('GameActions', actions);
            });
        });
    });
};