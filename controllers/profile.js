const mongoose = require('mongoose');
const User = require('../models/user');
const Person = require('../models/person');

// Read Profile
module.exports.profileRead = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }
};

// Add skill
// delete skill
// update level
// change password
