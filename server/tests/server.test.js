const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');



//This is a text fixture/setup facility in Mocha
beforeEach(populateUsers);
beforeEach(populateTodos);

// Test Suite for POST /todos route
describe('POST /todos Testsuite', () => {
  // Test case for correctly formed todo
  it('should create a new todo', (done) => {
    //console.log('Running Test');
    var text = 'Test todo text';
    // Using supertest - request
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

// Testsuite for getting todos by Id
describe('GET /todos/:id Testsuite', () => {
  it('should return todo doc for a valid Id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var newId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${newId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[1].tokens[0].token)
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
            expect(todo).toBeFalsy();
            done();
          }).catch((e) => done(e));
        });
    });

    it('should not remove a todo that user did not create', (done) => {
      var hexId = todos[0]._id.toHexString();

      request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          // query database using findById expect to Exist
          // as user not creator so should not be deleted
          Todo.findById(hexId).then((todo) => {
            expect(todo).toBeTruthy();
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return 404 if todo not found', (done) => {
      var newId = new ObjectID().toHexString();

      request(app)
        .delete(`/todos/${newId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object Id is invalid', (done) => {
        request(app)
          .delete('/todos/123')
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
    });
});

// Testsuite for updating todos
describe('PATCH /todos/:id Testsuite', () => {
  it('should update the todo text', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newTxt = 'Text Updated by test';
    var newTodo = {
      text: newTxt,
      completed: true
    };

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(newTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newTxt);
        expect(res.body.todo.completed).toBe(true);
        // expect(res.body.todo.completedAt).toBeA('number');
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Check database
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(newTxt);
          expect(todo.completed).toBe(true);
          // expect(res.body.todo.completedAt).toBeA('number');
          expect(typeof res.body.todo.completedAt).toBe('number');
          done();
        }).catch((e) => done(e));
      });

  });

  it('should not update the todo text if user not creator', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newTxt = 'Text Updated by test';
    var newTodo = {
      text: newTxt,
      completed: true
    };

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(newTodo)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Check database
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(todo.text);
          expect(todo.completed).toBe(todo.completed);
          expect(todo.completedAt).toBeFalsy();
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
      .set('x-auth', users[1].tokens[0].token)
      .send(newTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[1].text);
        expect(res.body.todo.completed).toBeFalsy();
        expect(res.body.todo.completedAt).toBeFalsy(); // or toNotExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Check database
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(todos[1].text);
          expect(todo.completed).toBeFalsy();
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
    });
});

// Testsuite for user authentication
describe('GET /users/me Testsuite', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);

  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

// Test Suite for user sign up Route
describe('POST /users testsuite', () => {
  it('should create a user with valid data', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then ((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors with invalid data', (done) => {
    var invalidEmail = 'example.com';
    var invalidPassword = '123';

    request(app)
      .post('/users')
      .send({invalidEmail, invalidPassword})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({invalidEmail}).then ((user) => {
          expect(user).toBeFalsy();
          done();
        });
      });
  });

  it('should not create user if email not unique', (done) => {
    var duplicateEmail = users[0].email;
    var password = users[0].password;

    request(app)
      .post('/users')
      .send({duplicateEmail, password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({duplicateEmail}).then ((user) => {
          expect(user).toBeFalsy();
          done();
        });
      });
    });
});

// Testsuite for user login routes
describe('POST /users/login Testsuite', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect ((res) => {
        expect (res.headers['x-auth']).toBeTruthy();
      })
      .end ((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch ((e) => (done(e)));
      })
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1' //Invalid password for test
      })
      .expect(400)
      .expect ((res) => {
        expect (res.headers['x-auth']).toBeFalsy();
      })
      .end ((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toEqual(1);
          done();
        }).catch ((e) => (done(e)));
      });
  });
});

//Testsuite for logging out user
// (i.e. deleting their authentication token for session)
describe('DELETE /users/me/token Testsuite', () => {
  it('should remove auth token on logout ', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toEqual(0);
          done();
        }).catch ((e) => (done(e)));
      });
  });
});
