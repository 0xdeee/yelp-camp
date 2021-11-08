const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewsController = require('../controllers/review');
const {
  validateReview,
  isLoggedIn,
  isAuthor,
} = require('../helpers/middleware');
const catchAsync = require('../helpers/catchAsync');

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(reviewsController.postNewReview)
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isAuthor, // authorization middleware
  catchAsync(reviewsController.deleteReview)
);

module.exports.reviewsRoutes = router;
