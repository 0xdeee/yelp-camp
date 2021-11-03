const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');
const { campgroundSchema } = require('../schema');

const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
      req.flash('error', 'cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  })
);

router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'successfully created a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
  })
);

router.patch(
  '/:id',
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
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted the campground');
    res.redirect('/campgrounds');
  })
);

module.exports.campgroundsRouter = router;
