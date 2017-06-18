const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Connect to the DB
mongoose.connect('');
mongoose.Promise = global.Promise; // mongoose version of promise is depricated

// setup express app
const app = express();

app.use(express.static('public'));

app.use(bodyParser.json());

// use the routes we specified in api.js
app.use('/api', require('./routes/api'));

// error handling middleware (the next middleware)
app.use(function(err, req, res, next){
  //console.log(err);
  res.status(422).send({error: err.message});
});

// listen for requests
app.listen(process.env.app || '4000', function(err){
  console.log('Listening on 4000');
});
