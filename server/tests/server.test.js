const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

//This is a text fixture/setup facility in Mocha
beforeEach((done) => {
  // Expression syntax
  //Todo.remove({}).then (() => done();
  // Statement syntax
  Todo.remove({}).then(() => {
    console.log('Cleaning database');
    done();
  });
});

// Test Suite for posted todo
describe('POST /todos', () => {
  // Test case for correctly formed todo
  it('should create a new todo', (done) => {
    console.log('Running Test');
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

      Todo.find().then((todos) => {
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
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });
// End of testsuite
});
