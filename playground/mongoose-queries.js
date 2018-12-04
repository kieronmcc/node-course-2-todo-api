const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
const {ObjectID} = require('mongodb');

// var id = '5c0666adbd1a79c4736c850411';
//
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Mongoose automatically converts id string to ObjectID
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos array', todos);
// });
//
// // Only gives first matching document
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo single', todo);
// });

// convenience method for finding by id
// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo By Id', todo);
// }).catch ((e) => console.log(e));

var userId = '5bffbc42b898947059985f38';
User.findById(userId).then((user) => {
  if (!user) {
    return console.log('User Id not found');
  }
  console.log('User By Id', JSON.stringify(user, undefined, 2));
}).catch ((e) => console.log(e));
