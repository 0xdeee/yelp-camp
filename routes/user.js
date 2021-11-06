const express = require('express');
const passport = require('passport');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../helpers/catchAsync');

const { User } = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body.user;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.flash('success', 'successfully created a new user');
      res.redirect('/campgrounds');
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('/user/register');
    }
  })
);

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/user/login',
  }),
  (req, res) => {
    req.flash('success', 'logged in successfully');
    res.redirect('/campgrounds');
  }
);

module.exports.usersRouter = router;
