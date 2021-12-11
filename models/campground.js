const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Review } = require('./review');

// defining image schema separately to add mongo virtual to the field
const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_150'); // to get image thumbnail from cloudinary
});

const campgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  { toJSON: { virtuals: true } } // to make virtual properties stay while converting doc to json
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong>${
    this.title
  }</strong><br><p>${this.description.substring(0, 100)}...</p>`;
});

campgroundSchema.virtual('properties.campgroundUrl').get(function () {
  return `${this._id}`;
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

module.exports.Campground = mongoose.model('Campground', campgroundSchema);
