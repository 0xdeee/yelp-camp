const passport = require('passport');
const { User } = require('../models/user');

module.exports.fetchRegisterUserForm = (req, res) => {
  res.render('users/register');
};

/**
 * register() is added by passport-local-mongoose to User model
 * @input newly created User model object & password as input
 * @output returns User object by adding hash(hashed password), salt
 * @warning do no add plain text password value while creating User object,
 * it will added by register() in hashed form
 */
module.exports.registerNewUser = async (req, res, next) => {
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
};

module.exports.fetchLoginForm = (req, res) => {
  res.render('users/login');
};

/**
 * passport.authenticate() does auth internally using passport.js
 * @param strategy - local, oauth, twitter etc.
 * @param failureFlash - if true if passes flash message on login error (message provided by passport.js)
 * @param failureRedirect - specified the redirection url in case of login failure
 * @returns passport.authenticate() middleware only let successful login passthrough to next() else redirects
 *
 * @output on success, req.session.requestedUrl is check for user requested URL to redirect
 * else redirected to /campgrounds
 */
module.exports.loginUser = passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/user/login',
});

module.exports.postLoginSuccessActions = (req, res) => {
  req.flash('success', 'logged in successfully');
  const redirectionUrl = req.session.requestedUrl || '/campgrounds';
  req.session.requestedUrl = '';
  res.redirect(redirectionUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  req.flash('success', 'logged out!');
  res.redirect('/user/login');
};
