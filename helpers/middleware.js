/**
 * this is middleware checks if user is authenticated, allows route if yes, If no -> redirects to login
 * it also stores the initial requested URL to session data, which can be used to redirect user
 * back to requested page after login instead of redirecting to common page.
 * @param {*} req
 * @param {*} res
 * @param {*} next continues to next middleware in the route pipe
 */
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
