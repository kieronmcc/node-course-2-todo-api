require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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
const port = process.env.PORT;

app.use(bodyParser.json());

// Add a todo
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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
app.get('/todos', authenticate, (req, res) => {
  // Call the Todo ORM model
  Todo.find({
      _creator: req.user._id // only find todos for authenticated user
  }).then ((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// Route to get an individual todo
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
   }

   Todo.findOne({
     _id: id,
     _creator: req.user._id
   }).then((todo) => {
     if (!todo) {
       res.status(404).send();
     }

     res.send({todo}); // or res.send({todo: todo}) is equivalent
   }).catch ((e) => res.status(400).send());

});

// Route to remove and indivdual todo
app.delete('/todos/:id', authenticate, (req, res) => {
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

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then ((todo) => {
    if (!todo) {
      res.status(404).send();
    }

    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

// Route to update individual todo
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  // validate the Id - return 404
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

   if(_.isBoolean(body.completed) && body.completed) {
     body.completedAt = new Date().getTime();
   } else {
     body.completed = false;
     body.completedAt = null;
   }
   // Mongoose {new: true} same as mongodb collections returnOriginal: false
   Todo.findOneAndUpdate(
     { _id: id,
       _creator: req.user._id
     }, {
       $set: body}, {
       new: true
     }).then((todo) => {
       if(!todo) {
         return res.status(404).send();
       }
       res.send({todo});
     }). catch((e) => {
       res.status(400).send();
     });
});

// POST /users - add new user (sign up)
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']); //pick function from lodash
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});



// In this privatised route the express middleware will
// call the authenticate method and get back a modifed, authenticated user
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// Route for user login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']); //pick function from lodash

  User.findByCredentials(body.email, body.password).then ((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    })
  }).catch ((e) => {
    res.status(400).send();
  });

});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then (() => {
    // promise resolved
    res.status(200).send();
  }, () => {
    // promise rejected
    res.status(400).send();
  });
});


// server application run listenng on configured port
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
