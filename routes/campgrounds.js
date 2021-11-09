const express = require('express');
const router = express.Router();
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
} = require('../helpers/middleware');
const campgroundsController = require('../controllers/campground');
const catchAsync = require('../helpers/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // defining storage as cloudinary storage config to multer

router.route('/').get(catchAsync(campgroundsController.getAllCampgrounds)).post(
  isLoggedIn,
  upload.array('campground[image]', 5), // parsing form data with enctype="multipart/form-data"
  validateCampground,
  catchAsync(campgroundsController.createNewCampground)
);

router.get(
  '/new',
  isLoggedIn,
  campgroundsController.renderCreateCampgroundsForm
);

router
  .route('/:id')
  .get(catchAsync(campgroundsController.getSpecificCampground))
  .patch(
    isLoggedIn,
    isAuthor, // authorization middleware
    validateCampground,
    catchAsync(campgroundsController.updateCampgrounds)
  );

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor, // authorization middleware
  catchAsync(campgroundsController.renderEditCampgroundsForm)
);

router.delete(
  '/:id/delete',
  isLoggedIn,
  isAuthor, // authorization middleware
  catchAsync(campgroundsController.deleteCampgrounds)
);

module.exports.campgroundsRoutes = router;
