const { Campground } = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.getAllCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderCreateCampgroundsForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.getSpecificCampground = async (req, res) => {
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
};

module.exports.createNewCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  // getting the array of uploaded image metadata from req.files provided by multer and adding it to model
  campground.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  // before creating campground, passing loggedIn user's _id as author field ref
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'successfully created a new campground');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderEditCampgroundsForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampgrounds = async (req, res) => {
  const { id } = req.params;
  console.log(req.body.deleteImages);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  // after updating any text field change, pushing the added images to array in DB
  const images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.images.push(...images);
  await campground.save();
  // if deleteImages is sent in req.body then delete it from cloudinary and pull those images out of document in DB
  if (req.body.deleteImages) {
    for (const filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash('success', 'successfully updated the campground');
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampgrounds = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'successfully deleted the campground');
  res.redirect('/campgrounds');
};
