const express = require('express');
const passport = require('passport');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../helpers/catchAsync');
const { isLoggedIn } = require('../middleware');

const { User } = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body.user;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          next(err);
        } else {
          req.flash('success', 'Successfully registered!');
          res.redirect('/campgrounds');
        }
      });
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
    const redirectionUrl = req.session.requestedUrl || '/campgrounds';
    req.session.requestedUrl = '';
    res.redirect(redirectionUrl);
  }
);

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.flash('success', 'logged out!');
  res.redirect('/user/login');
});

module.exports.usersRouter = router;
