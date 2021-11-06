module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.isAuthenticated());
  if (!req.isAuthenticated()) {
    req.flash('error', 'you must be signed in first');
    res.redirect('/user/login');
  } else {
    next();
  }
};
