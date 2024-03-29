const { Campground } = require('../models/campground');
const { Review } = require('../models/review');

module.exports.postNewReview = async (req, res) => {
  const { id } = req.params;
  const review = new Review(req.body.review);
  // setting current logged in user's _id as author ref in Review model
  review.author = req.user._id;
  await review.save();
  const addReviewStatus = await Campground.findByIdAndUpdate(
    id,
    { $push: { reviews: review } },
    { runValidators: true }
  );
  console.log(addReviewStatus);
  req.flash('success', 'successfully added a new comment');
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'successfully deleted the comment');
  res.redirect(`/campgrounds/${id}`);
};
