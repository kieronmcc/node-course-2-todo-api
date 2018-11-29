//const MongoClient = require ('mongodb').MongoClient;
const {MongoClient, ObjectID} = require ('mongodb');


MongoClient.connect('mongodb://localhost:27017/ToDoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('5bfe926dbd717241e99074ab')
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false
  // }).then ((result) => {
  //   console.log(result);
  // });

  db.collection('Users').findOneAndUpdate({
    name: 'Fred McCarthy'
  }, {
    $set: {
      name: 'Burt McCarthy'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }). then ((result) => {
    console.log(result);
  });

  //db.close();
});
