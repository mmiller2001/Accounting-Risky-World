const express = require('express')
const router = express.Router();
const pool = require('../database');

const { isLoggedIn, isNotLoggedin } = require('../lib/auth');
const passport = require('passport');

router.get('/signup', isNotLoggedin, (req, res) => {
    res.render('auth/signup')
})

router.post('/signup', isNotLoggedin, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}))

router.get('/signin', isNotLoggedin, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedin, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
})

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/signin');
    });
    // res.redirect('/signin')
});

module.exports = router;