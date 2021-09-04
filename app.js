const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to DB'))
  .catch((error) => console.log(error));

const db = mongoose.connection;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// starting the express server
const port = 8080;
app.listen(port, () => {
  console.log('server started and listening to 8080');
});

app.get('/', (req, res) => {
  res.send('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/show', { campground });
});

app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body);
  await campground.save();
  res.redirect('/campgrounds');
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
});

app.patch('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, req.body);
  res.redirect(`/campgrounds/${id}`);
});

app.delete('/campgrounds/:id/delete', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  console.log('deleted');
  res.redirect('/campgrounds');
});
