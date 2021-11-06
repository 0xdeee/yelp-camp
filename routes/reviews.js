const express = require('express');
const router = express.Router({ mergeParams: true });

const { Campground } = require('../models/campground');
const { Review } = require('../models/review');
const { reviewSchema } = require('../schema');

const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    await review.save();
    const addReviewStatus = await Campground.findByIdAndUpdate(
      id,
      { $push: { reviews: review } },
      { runValidators: true }
    );
    console.log(addReviewStatus);
    req.flash('success', 'successfully added a new comment');
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted the campground');
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports.reviewsRouter = router;
