module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    console.log(req.method + ' ' + req.originalUrl);
    if (req.method === 'GET' && req.originalUrl) {
      req.session.requestedUrl = req.originalUrl;
    }
    req.flash('error', 'you must be signed in first');
    res.redirect('/user/login');
  } else {
    next();
  }
};
