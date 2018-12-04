const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
const {ObjectID} = require('mongodb');

// Todo.remove({}).then ((result) => {
//   console.log(result);
// });

Todo.findOneAndRemove({_id: '5c06bcdbbd717241e991ae62'}).then((todo) => {
  console.log(todo);
});

// This will still return success even if no document was found to delete
Todo.findByIdAndRemove('5c06bcdbbd717241e991ae62').then ((todo) => {
  console.log(todo);
});
