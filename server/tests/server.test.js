const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Fixture data to seed DB
const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'

}];

//This is a text fixture/setup facility in Mocha
beforeEach((done) => {
  // Expression syntax
  //Todo.remove({}).then (() => done();
  // Statement syntax
  Todo.remove({}).then(() => {
    //console.log('Preparing database for testing');
    // Returning here allows the callback (i.e. 'then') to be chained
    return Todo.insertMany(todos);
  }).then(() => done())  //expression syntax for arrow function
});

// Test Suite for POST /todos route
describe('POST /todos Testsuite', () => {
  // Test case for correctly formed todo
  it('should create a new todo', (done) => {
    //console.log('Running Test');
    var text = 'Test todo text';
    // Using supertest - request
    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      // Only find todos that match body set above
      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch ((e) => done(e));
    })
  });

  // test case for incorrectly formed todo
  it('Should not create a todo with invalid body data', (done) => {
    request(app)
    .post('/todos')
    .send({}) // send empty request so fails
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);  // because error case so no 3rd added
        done();
      }).catch((e) => done(e));
    });
  });
// End of testsuite (i.e. describe block)
});

// Testsuite for GET /todos route
describe('GET /todos Testsuite', () => {
  it('should get all todos', (done) => {
    //SuperTest request
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});
