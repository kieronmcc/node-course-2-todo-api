var mongoose = require('mongoose');
// make User model - email - required, trimmed, type = string minLength 1
var User = mongoose.model('User', {
  email: {
    type: String,
    minlength: 1,
    required: true,
    trim: true
  }
});

module.exports = {User};
