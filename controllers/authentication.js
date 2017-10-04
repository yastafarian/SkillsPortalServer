const passport = require('passport');
const User = require('../models/user.js');
const Person = require('../models/person.js');

const sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};



const createProfile = function(user){
  var profile = new Person();
  profile.name = user.name;
  profile.username = user.username;

  profile.save(function(err) {
    if (!err){
      console.log('created new profile');
    }
  });
};

const createUser = function(req, res) {
    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;

    user.setPassword(req.body.password);

    user.save(function(err) {
        var token;
        token = user.generateJwt();
        createProfile(user);
        res.status(200);
        res.json({
            "token" : token
        });
    });
};

/*
1- take the data from the submitted form and create a new Mongoose model
instance.
2- Call the setPassword method we created earlier to add the salt and the
hash to the instance.
3- Save the instance as a record to the database
4- Generate a JWT
5- Send the JWT inside the JSON respons
*/

module.exports.register = function(req, res) {
  console.log('POST /register');
  if(!req.body.name || !req.body.email ||
    !req.body.password || !req.body.username) {
      sendJSONresponse(res, 400, {
        "message": "All fields required"
      });
      return;
    }

    // Check if the username or email already exist
    User.find({$or:[{username: req.body.username},
                    {email: req.body.email}]}).then(function(result){
      var users = result.slice();
      if (users.length > 0) {
        if (users[0].username === req.body.username) {
          sendJSONresponse(res, 200, {
            "message": "Username already exists"
          });
        }
        else {
          sendJSONresponse(res, 200, {
            "message": "Email already exists"
          });
        }
      }
      else{
        createUser(req, res);
      }
    });

  };

  module.exports.login = function(req, res) {
    console.log('POST /login');
    console.log(req.body.username);
    if(!req.body.password || !req.body.username) {
      sendJSONresponse(res, 200, {
        "message": "All fields required"
      });
      return;
    }

    // tell passport to use local startegy
    passport.authenticate('local', function(err, user, info){
      var token;

      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      // If a user is found
      if(user){
        token = user.generateJwt();
        console.log(token);
        res.status(200);
        res.json({
          "token" : token
        });
      } else {
        // If user is not found
        res.status(200).json(info);
      }
    })(req, res);

  };
