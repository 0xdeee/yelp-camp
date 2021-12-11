if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} // configures environment variable using dotenv to .env file when environment is not prod
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
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

const { User } = require('./models/user');
const { campgroundsRoutes } = require('./routes/campgrounds');
const { reviewsRoutes } = require('./routes/reviews');
const { usersRoutes } = require('./routes/user');
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
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
); // to protect against mongo injection

// auth config using passport.js
app.use(passport.initialize());
app.use(passport.session());
// invoking authenticate() in User model created by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// common middleware
app.use((req, res, next) => {
  // req.user set by passport after login, storing value in locals
  // to check if user is loggedIn in ejs templates
  res.locals.loggedInUser = req.user;
  // adding flash values in locals to fetch it in ejs templates
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// routes
app.use('/campgrounds', campgroundsRoutes); //for campground routes
app.use('/campgrounds/:id/reviews', reviewsRoutes); //for review routes
app.use('/user', usersRoutes); // for user router
app.get('/', (req, res) => res.render('home')); // home route
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
