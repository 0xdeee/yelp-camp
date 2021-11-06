const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const app = express();

const { User } = require('./models/user');
const { campgroundsRouter } = require('./routes/campgrounds');
const { reviewsRouter } = require('./routes/reviews');
const { usersRouter } = require('./routes/user');
const catchAsync = require('./helpers/catchAsync');
const ExpressError = require('./helpers/ExpressError');

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to DB'))
  .catch((error) => console.log(error));

const db = mongoose.connection;

// express config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('common'));
app.engine('ejs', ejsMate);
const sessionConfig = {
  secret: 'qwerty',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// custom middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// routes
app.use('/campgrounds', campgroundsRouter); //for campground routes
app.use('/campgrounds/:id/reviews', reviewsRouter); //for review routes
app.use('/user', usersRouter); // for user router
app.get('/', (req, res) => res.redirect('/campgrounds'));
app.all('*', (req, res, next) => next(new ExpressError('Page not found', 404))); //for undefined routes

// error handlers
app.use(function (err, req, res, next) {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
});

// starting the express server
const port = 8080;
app.listen(port, () => {
  console.log('server started and listening to 8080');
});
