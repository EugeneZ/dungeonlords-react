#!/usr/bin/env node

var debug = require('debug')('dungeonlords-react:server');
var http = require('http');
var mongoose = require('mongoose');
var config = require('config-heroku');

mongoose.connect(config.db.connectionString, function(err) {
    if (err) {
        console.error('Error:', err.message);
        return console.error('**Could not connect to MongoDB. Please ensure mongod is running and restart MEAN app.**');
    }

    var schemas = require('./server/models');
    var app = require('./server/app');
    var port = parseInt(process.env.PORT, 10) || 3000;
    app.set('port', port);

    var server = http.createServer(app);

    server.listen(port);

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
