var mongoose = require('mongoose');
// A mongoose model is a schema (DDL)
// Mongoose is an ORM
// Mongoose takes model name, pluralises it and sets it to lower case to
// make collection name (e.g. 'todos')
var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todo};
