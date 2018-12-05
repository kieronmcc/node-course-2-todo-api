const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Fixture data to seed DB
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
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

// Testsuite for GET /todos list route
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

// Testsuite for getting todos by Id
describe('GET /todos/:id Testsuite', () => {
  it('should return todo doc for a valid Id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var newId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${newId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

// Testsuite for removing todos by Id
describe('DELETE /todos/:id Testsuite', () => {
    it('should remove a todo', (done) => {
      var hexId = todos[1]._id.toHexString();

      request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          // query database using findById expect toNotExist
          Todo.findById(hexId).then((todo) => {
            expect(todo).toNotExist();
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return 404 if todo not found', (done) => {
      var newId = new ObjectID().toHexString();

      request(app)
        .delete(`/todos/${newId}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object Id is invalid', (done) => {
        request(app)
          .delete('/todos/123')
          .expect(404)
          .end(done);
    });
});

// Testsuite for updating todos
describe('PATCH /todos/:id', () => {
  it('should update the todo text', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newTxt = 'Text Updated by test';
    var newTodo = {
      text: newTxt,
      completed: true
    };

    request(app)
      .patch(`/todos/${hexId}`)
      .send(newTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newTxt);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Check database
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(newTxt);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((e) => done(e));
      });

  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var newTodo = {
      completed: false
    };

    request(app)
      .patch(`/todos/${hexId}`)
      .send(newTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[1].text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null); // or toNotExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Check database
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(todos[1].text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done();
        }).catch((e) => done(e));
      });
    });
});
