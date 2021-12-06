const mongoose = require('mongoose');
const { Campground } = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const mapBoxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCodingService = mapBoxGeoCoding({
  accessToken:
    'pk.eyJ1Ijoic3BhY2VvcnBoYW45OSIsImEiOiJja3czc3F1ZjkwYTZnMzFudjFxdzUxczl6In0.rs9y9V_xrgrN8bsjs4mzPA',
});

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to DB'))
  .catch((error) => console.log(error));

const db = mongoose.connection;

//reset DB records

const dbReset = async () => {
  await Campground.deleteMany({});
  for (let index = 0; index < 50; index++) {
    const random1to1000 = Math.floor(Math.random() * 1000);
    const randomFromArray = (array) =>
      array[Math.floor(Math.random() * array.length)];
    const campGroundLocation = `${cities[random1to1000].city}, ${cities[random1to1000].state}`;
    const campGroundGeoCode = await geoCodingService
      .forwardGeocode({
        query: campGroundLocation,
        limit: 1,
      })
      .send();
    const camp = new Campground({
      title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
      location: campGroundLocation,
      geometry: campGroundGeoCode.body.features[0].geometry,
      images: [
        {
          url: 'https://res.cloudinary.com/spaceorphan99-cloudinary-clouds/image/upload/v1636475989/yelp-camp/exigqgouioqmzo8p8zfl.jpg',
          filename: 'exigqgouioqmzo8p8zfl',
        },
        {
          url: 'https://res.cloudinary.com/spaceorphan99-cloudinary-clouds/image/upload/v1636475761/yelp-camp/adeiryxmzixnuofapbnt.jpg',
          filename: 'adeiryxmzixnuofapbnt',
        },
      ],
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. A excepturi culpa unde reiciendis eius aspernatur. Facilis nemo id, nihil impedit praesentium tempore reiciendis omnis minus, quaerat nisi accusamus, architecto quisquam?',
      price: Math.floor(Math.random() * 20) + 10,
      author: '618690e5f95098f9872c13c8', // add a random user here while creating seed data
    });
    await camp.save();
  }
};

dbReset().then(() => {
  console.log('data inserted');
  db.close();
});
