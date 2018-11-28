//const MongoClient = require ('mongodb').MongoClient;
const {MongoClient, ObjectID} = require ('mongodb');

// How to generate an object ID using mongo library
// var obj = new ObjectID();
// console.log(obj);

// Mongo desctructuring example
// var user = {name: 'Kieron', age: 55};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/ToDoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo', err)
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2))
  // });

  // db.collection('Users').insertOne({
  //   name: 'Kieron McCarthy',
  //   age: 55,
  //   location: 'France'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert user', err)
  //   }
  //   console.log(result.ops[0]._id.getTimestamp());
  // });


  db.close();
});
