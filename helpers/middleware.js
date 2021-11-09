const { Campground } = require('../models/campground');
const { Review } = require('../models/review');
const { campgroundSchema } = require('../schema');
const { reviewSchema } = require('../schema');
const ExpressError = require('../helpers/ExpressError');

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

/**
 * middleware to check if req.body confirm to campground schema requirements of JOI
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

/**
 * middleware to check if req.body confirms to review schema requirements of JOI
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

/**
 * Authorization middleware checks during edit, delete action to confirm logged in user is creator of the document
 * if id param is passed and reviewId param is not, then it check if current loggedInUser is author of
 * the campground with _id as id
 * if id and reviewId both params are passed, it will check if the loggedInUser is the author of the
 * review with the _id reviewId
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  if (id && !reviewId) {
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'you do not have permission to do that');
      res.redirect(`/campgrounds/${id}`);
    } else {
      next();
    }
  } else if (id && reviewId) {
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
      req.flash('error', 'you do not have permission to do that');
      res.redirect(`/campgrounds/${id}`);
    } else {
      next();
    }
  }
};
