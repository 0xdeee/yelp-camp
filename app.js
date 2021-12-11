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
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const app = express();

const { User } = require('./models/user');
const { campgroundsRoutes } = require('./routes/campgrounds');
const { reviewsRoutes } = require('./routes/reviews');
const { usersRoutes } = require('./routes/user');
const ExpressError = require('./helpers/ExpressError');

const mongoDBUrl =
  process.env.MONGO_ATLAS_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose
  .connect(mongoDBUrl, {
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

const secret = process.env.SECRET_PHRASE || 'testingsecret';
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: mongoDBUrl,
    touchAfter: 24 * 60 * 60, // time period in seconds
    autoRemove: 'interval',
    autoRemoveInterval: 7 * 24 * 60,
  }),
  secret,
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

app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/npm/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dlsvm1iii/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started and listening to ${port}`);
});
