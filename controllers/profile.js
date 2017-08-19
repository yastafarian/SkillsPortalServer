const mongoose = require('mongoose');
const User = require('../models/user');
const Person = require('../models/person');

const ctrlPeople = require('../controllers/people');
const ctrlSkills = require('../controllers/skills');

// Read Profile
module.exports.profileRead = function(req, res) {
  console.log('GET /profile');
  if (!req.payload._id) {
      console.log(req);
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        const u = new User(user);
        Person.findOne({'username': u.username}).exec(function(err, person){
            res.status(200).json(person);
        });
      });
  }
};

// delete skill
// update level
// change password
