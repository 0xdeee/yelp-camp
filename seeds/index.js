const mongoose = require('mongoose');
const { Campground } = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');

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
    const camp = new Campground({
      title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
      location: `${cities[random1to1000].city}, ${cities[random1to1000].state}`,
      images: [
        {
          url: 'https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/Campground.jpg',
          filename: 'campground',
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
