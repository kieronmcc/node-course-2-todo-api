var env = process.env.NODE_ENV || 'development';

// set env variable from a json config file instead on
// a javascript program
if (env ==='development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]; // set the env from key value
  });
}
