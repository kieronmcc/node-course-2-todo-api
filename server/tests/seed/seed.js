const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

// Fixtures data to seed DB
const UserOneId = new ObjectID();
const UserTwoId = new ObjectID();
const users = [{
    _id: UserOneId,
    email: 'kieron@example.com',
    password: 'UserOnePass',
    tokens:[{
      access: 'auth',
      token: jwt.sign({_id: UserOneId, access: 'auth'}, 'abc123').toString()
    }]
  },
  {
      _id: UserTwoId,
      email: 'fred@example.com',
      password: 'UserTwoPass',
      tokens:[{
        access: 'auth',
        token: jwt.sign({_id: UserTwoId, access: 'auth'}, 'abc123').toString()
      }]
}];


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: UserOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: UserTwoId
}];

const populateTodos  = (done) => {
  // Expression syntax
  //Todo.remove({}).then (() => done();
  // Statement syntax
  Todo.remove({}).then(() => {
    //console.log('Preparing database for testing');
    // Returning here allows the callback (i.e. 'then') to be chained
    return Todo.insertMany(todos);
  }).then(() => done())  //expression syntax for arrow function
};

const populateUsers = (done) => {
  User.remove({}).then (() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    // wait for all save operations to complete
    // sing Promise.all
    return Promise.all([userOne, userTwo])
  }).then(() => done()); // execute resulting promise calling done
};

module.exports = {todos, populateTodos, users, populateUsers};
