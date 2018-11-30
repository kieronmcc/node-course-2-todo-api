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

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
