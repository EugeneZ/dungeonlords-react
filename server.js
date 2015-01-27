#!/usr/bin/env node

var debug = require('debug')('dungeonlords-react:server');
var http = require('http');
var mongoose = require('mongoose');
var config = require('config-heroku');
var socketio = require('socket.io');

mongoose.connect(config.db.connectionString, function(err) {
    if (err) {
        console.error('Error:', err.message);
        return console.error('**Could not connect to MongoDB. Please ensure mongod is running and restart app.**');
    }

    // Load Database Schemas
    require('./server/models');

    // Bootstrap Express
    var app = require('./server/app');
    var port = parseInt(process.env.PORT, 10) || 3000;
    app.set('port', port);

    // Create Server
    var server = http.createServer(app);

    // Bootstrap Websockets/IO interface
    var io = socketio(server);
    require('./server/io')(io);

    // Start server
    server.listen(port);

    // Error handlers
    server.on('error', function(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error('Port ' + port + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('Port ' + port + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    server.on('listening', function() {
        debug('Listening on port ' + server.address().port);
    });
});
