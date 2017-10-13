const express = require('express'); //middleware for building REST API
const bodyParser = require('body-parser'); //to parse JSON requests
const mongoose = require('mongoose'); //To access our MongoDb
const passport = require('passport'); // To login users
require('dotenv').config(); //For environment variables

//Connect to the DB
mongoose.connect(process.env.DB_URL);
mongoose.Promise = global.Promise;

// setup express app
const app = express();

// CORs
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  next();
});

app.use(express.static('public'));

app.use(bodyParser.json());

require('./config/passport');

app.use(passport.initialize());

// use the routes we specified in api.js
app.use('/api', require('./routes/api'));


// error handling middleware (the next middleware)
app.use(function(err, req, res, next){
  console.log(err);
  res.status(422).send({error: err.message});
});

// listen for requests
app.listen(process.env.app || '4000', function(err){
  console.log('Listening on 4000');
});
