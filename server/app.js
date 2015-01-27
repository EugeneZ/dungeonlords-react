var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var less = require('less-middleware');
var config = require('config-heroku');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var routes = require('./routes/index');
var api = require('./routes/api');
var passportConfig = require('./passport');
var passportRouter = passportConfig(passport, config);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine({}));

app.use(favicon(__dirname + '/../public/assets/images/favicon.ico')); // favicon caching and such
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: config.cookie.secret,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(less(path.join(__dirname, '/../public')));
app.use(express.static(path.join(__dirname, '/../public')));
app.use(flash());

app.use('/', routes);
app.use('/api', api);
app.use('/auth', passportRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// will print stacktrace
if (app.get('env') === 'development') {

    app.use('/api', function(err, req, res, next){
        res.status(500).json(err);
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// no stacktraces leaked to user
app.use('/api', function(err, req, res, next){
    res.status(500).json({ error: 'An error occured' });
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
