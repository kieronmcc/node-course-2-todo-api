var {ObjectID} = require('mongodb');

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
const port = process.env.PORT || 3000;

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

// Route to get an individual todo
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
   }

   Todo.findById(id).then((todo) => {
     if (!todo) {
       res.status(404).send();
     }

     res.send({todo}); // or res.send({todo: todo}) is equivalent
   }).catch ((e) => res.status(400).send());

});

// Route to remove and indivdual todo
app.delete('/todos/:id', (req, res) => {
  //get the Id
  var id = req.params.id;

  // validate the Id - return 404
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
   }

  // remove tod by Id
  //success
    //if no doc send 404
    //if doc, send doc back with 200
  //console.error()
    // 400 with empty body

  Todo.findByIdAndRemove(id).then ((todo) => {
    if (!todo) {
      res.status(404).send();
    }

    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

// server application run listenng on configured port
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
