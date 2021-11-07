const express = require('express');
const router = express.Router();

const { Campground } = require('../models/campground');
const { isLoggedIn } = require('../helpers/middleware');
const { validateCampground } = require('../helpers/middleware');
const { isAuthor } = require('../helpers/middleware');
const catchAsync = require('../helpers/catchAsync');

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
      .populate({
        // to populate author field inside review while populating review inside campground schema
        path: 'reviews',
        populate: {
          path: 'author',
          module: 'User',
        },
      })
      .populate('author'); // to populate author field inside campground schema
    if (!campground) {
      req.flash('error', 'cannot find that campground');
      res.redirect('/campgrounds');
    }
    console.log(campground);
    res.render('campgrounds/show', { campground });
  })
);

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // before creating campground, passing loggedIn user's _id as author field ref
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully created a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor, // authorization middleware
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
  })
);

router.patch(
  '/:id',
  isLoggedIn,
  isAuthor, // authorization middleware
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'successfully updated the campground');
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  '/:id/delete',
  isLoggedIn,
  isAuthor, // authorization middleware
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted the campground');
    res.redirect('/campgrounds');
  })
);

module.exports.campgroundsRoutes = router;
