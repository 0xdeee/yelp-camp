const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');

const campgroundSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

// mongoose 'post middleware to delete all reviews inside a campgrounds once the campground itself is deleted
campgroundSchema.post('findOneAndDelete', async function (campground) {
  // even though at this point the campground itself is already deleted, mongoose passed the doc value to the
  // post-middleware
  if (campground.reviews) {
    console.log(
      await Review.deleteMany({
        $in: { _id: campground.reviews },
      })
    );
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);
