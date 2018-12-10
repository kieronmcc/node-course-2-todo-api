const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
      type: String,
      minlength: 1,
      required: true,
      trim: true,
      unique: true,
      validate: {
        // validator: (value) => {
        //   return validator.iEmail(value);
        // },
        // message: '{VALUE} is not a valid email'
        // shorten this // TODO:
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
      }
    },
      password: {
        type: String,
        required: true,
        minlength: 6
      },
      tokens: [{
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
      }]
  }
);

// Override toJSON to limit user data sent back to client
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// Not using  arrow function as do not allow access to 'this' keyword
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  //user.tokens.push({access, token});
  //console.log('User tokens',user.tokens);
  user.tokens = user.tokens.concat([{access, token}]);
  return user.save().then(() => {
    return token; // passes this object on to the next promise in the chain
  });
};

// Retrieve user document using authentication token
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
    console.log('Decoded token', decoded);
  } catch (e) {
    // return new Promise(( resolve, reject) => {
    //   reject();
    // });
    return Promise.reject(); // same as above but simpler
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

// make User model - email - required, trimmed, type = string minLength 1
var User = mongoose.model('User', UserSchema);

module.exports = {User};
