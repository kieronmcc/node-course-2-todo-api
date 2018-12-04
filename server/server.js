var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var User = require('./models/user');

// ************ Original Examples *********************
// var newTodo = new Todo({
//
// });
//
// newTodo.save().then((doc) => {
//   console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
//   console.log('Unable to save todo', e)
// });
//
//
//
// var newUserGood = new User({
//   email: '  fred@gmail.com  '
// });
//
// var newUserBad = new User({});
//
// newUserGood.save().then((user) => {
//     console.log(JSON.stringify(user, undefined, 2));
// }, (err) => {
//     console.log('Unable to save todo', e);
// });
//
// newUserBad.save().then((user) => {
//     console.log(JSON.stringify(user, undefined, 2));
// }, (err) => {
//     console.log('Unable to save todo', e);
// });

var app = express();

app.use(bodyParser.json());

// Add a todo
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then( (doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

// Retrieve all existing todos
// A js object is sent - send({todos}) as opposed to
// send(todos) which is just an array
// Tis object could then be modified so more flexible approach
app.get('/todos', (req, res) => {
  // Call the Todo ORM model
  Todo.find().then ((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
