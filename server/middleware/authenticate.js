var {User} = require('./../models/user')

// Middleware function to make routes private
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(); // defers to catch block - avoids typing same code
    }

    // Modify req object to be used by caller
    // (i.e. instead of directly sending user in a response)
    req.user = user;
    req.token = token;
    next(); // so the next function in the route call is executed (i.e the arrow function)
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
