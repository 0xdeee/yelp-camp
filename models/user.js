const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

/**
 * passing passport-local-mongoose to userSchema as a plugin gives lot of feature to User model
 * that are built by passport.js.
 * - can be used to authenticate()
 * - can be used to register()
 * ...
 */
userSchema.plugin(passportLocalMongoose);

module.exports.User = mongoose.model('User', userSchema);
