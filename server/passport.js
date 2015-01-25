'use strict';

var mongoose = require('mongoose'),
    //TwitterStrategy = require('passport-twitter').Strategy,
    //FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    User = mongoose.model('User'),
    router = require('express').Router();

var passportConfig = function(passport, config) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, '-salt -hashed_password', function(err, user) {
            done(err, user);
        });
    });

    // Use twitter strategy
    //passport.use(new TwitterStrategy({
    //        consumerKey: config.twitter.clientID,
    //        consumerSecret: config.twitter.clientSecret,
    //        callbackURL: config.twitter.callbackURL
    //    },
    //    function(token, tokenSecret, profile, done) {
    //        User.findOne({
    //            'twitter.id_str': profile.id
    //        }, function(err, user) {
    //            if (err) {
    //                return done(err);
    //            }
    //            if (user) {
    //                return done(err, user);
    //            }
    //            user = new User({
    //                name: profile.displayName,
    //                username: profile.username,
    //                provider: 'twitter',
    //                twitter: profile._json,
    //                roles: ['authenticated']
    //            });
    //            user.save(function(err) {
    //                if (err) {
    //                    console.log(err);
    //                    return done(null, false, {message: 'Twitter login failed, email already used by other login strategy'});
    //                } else {
    //                    return done(err, user);
    //                }
    //            });
    //        });
    //    }
    //));
    //
    //// Use facebook strategy
    //passport.use(new FacebookStrategy({
    //        clientID: config.facebook.clientID,
    //        clientSecret: config.facebook.clientSecret,
    //        callbackURL: config.facebook.callbackURL
    //    },
    //    function(accessToken, refreshToken, profile, done) {
    //        User.findOne({
    //            'facebook.id': profile.id
    //        }, function(err, user) {
    //            if (err) {
    //                return done(err);
    //            }
    //            if (user) {
    //                return done(err, user);
    //            }
    //            user = new User({
    //                name: profile.displayName,
    //                email: profile.emails[0].value,
    //                username: profile.username || profile.emails[0].value.split('@')[0],
    //                provider: 'facebook',
    //                facebook: profile._json,
    //                roles: ['authenticated']
    //            });
    //            user.save(function(err) {
    //                if (err) {
    //                    console.log(err);
    //                    return done(null, false, {message: 'Facebook login failed, email already used by other login strategy'});
    //                } else {
    //                    return done(err, user);
    //                }
    //            });
    //        });
    //    }
    //));

    // Use google strategy
    passport.use(new GoogleStrategy({
            clientID: config.auth.google.clientID,
            clientSecret: config.auth.google.clientSecret,
            callbackURL: config.auth.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'google.id': profile.id
            }, function(err, user) {
                if (user) {
                    return done(err, user);
                }
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.emails[0].value,
                    provider: 'google',
                    google: profile._json,
                    roles: ['authenticated']
                });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                        return done(null, false, {message: 'Google login failed, email already used by other login strategy'});
                    } else {
                        return done(err, user);
                    }
                });
            });
        }
    ));

    // Routing
    //router.get('/facebook', passport.authenticate('facebook', {
    //    scope: ['email'],
    //    failureRedirect: '#!/login'
    //}));
    //
    //router.get('/facebook/callback', passport.authenticate('facebook', {
    //    failureRedirect: '#!/login',
    //    successRedirect: '/'
    //}));
    //
    //router.get('/twitter', passport.authenticate('twitter', {
    //    failureRedirect: '#!/login'
    //}));
    //
    //router.get('/twitter/callback', passport.authenticate('twitter', {
    //    failureRedirect: '#!/login',
    //    successRedirect: '/'
    //}));

    router.get('/google', passport.authenticate('google', {
        failureRedirect: '/',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

    router.get('/google/callback', passport.authenticate('google', {
        failureRedirect: '/'
    }), function(req, res){
        res.redirect('/');
    });

    router.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    return router;
};

module.exports = passportConfig;