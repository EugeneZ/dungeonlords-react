var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/client');
    } else {
        res.render('index', {
            title: 'Dungeon Lords Helper',
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    }
});

router.get('/client', function(req, res){
    if (req.isAuthenticated()) {
        res.render('client', {
            title: 'Dungeon Lords Helper',
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
