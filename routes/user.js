const express = require('express');
const router = express.Router({ mergeParams: true });
const usersController = require('../controllers/user');
const catchAsync = require('../helpers/catchAsync');
const { isLoggedIn } = require('../helpers/middleware');

router
  .route('/register')
  .get(usersController.fetchRegisterUserForm)
  .post(catchAsync(usersController.registerNewUser));

router
  .route('/login')
  .get(usersController.fetchLoginForm)
  .post(usersController.loginUser, usersController.postLoginSuccessActions);

/**
 * check if logged in using isLoggedIn middleware
 * if yes, then on requesting this route, invoke logout() in Express.Request to logout the user
 * Express.Request.logout() added by passport.js
 */
router.get('/logout', isLoggedIn, usersController.logoutUser);

module.exports.usersRoutes = router;
