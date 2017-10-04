
const User = require('../models/user');
const Person = require('../models/person');
const Skill = require('../models/skill');


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
module.exports.deleteSkill = function(req, res, next){
    console.log('delete skill ' + req.param.skill);
    if (!req.payload._id) {
        console.log(req);
        res.status(401).json({
            "message" : "UnauthorizedError: private profile"
        });
    } else {
        User
            .findById(req.payload._id)
            .exec(function (err, user) {
                const u = new User(user);
                Person.findOne({'username': u.username}).exec(function (err, person) {
                    // update the server document
                    Person.findOneAndUpdate({username: person.username},
                        {$pull: {"skills": {"title": req.params.skill}}},
                        { new: true},
                        function(err, person){
                            if (err) console.log(err);
                            if (person) {
                                res.status(200).json(person);
                            }
                        });

                    // update the skill document
                    Skill.findOneAndUpdate({title: req.params.skill},
                        {$pull: {"people": {"username": person.username}}},
                        { new: true},
                        function(err, skill){
                            if (err) console.log(err);
                            if (skill) console.log(skill);
                        });
                });
            });
    }
};

// Add Skill
module.exports.addSkill = function(req, res, next){
    console.log('add skill ' + req.body.title);
    if (!req.payload._id) {
        console.log(req);
        res.status(401).json({
            "message" : "UnauthorizedError: private profile"
        });
    } else {
        // Check if the user exist
        User
            .findById(req.payload._id)
            .exec(function (err, user) {
                const u = new User(user);
                Person.findOne({'username': u.username}).exec(function (err, person) {

                    // Check if the person already has the skill
                    personSkills = person.skills.filter(function(s){
                        return s.title === req.body.title;
                    });

                    if (personSkills.length > 0) {
                        res.status(409).json({
                            "message" : person.username + " already has " + req.body.title
                        });
                    }
                    else {
                        // update the server document
                        Person.findOneAndUpdate({username: person.username},
                            {$push: {"skills": req.body}},
                            {new: true},
                            function (err, person) {
                                if (err) console.log(err);
                                if (person) {
                                    res.status(200).json(person);
                                }
                            });

                        // update the skill document

                        const newPerson = {
                            username: person.username,
                            level: req.body.level
                        }
                        // update the skill document
                        Skill.findOneAndUpdate({title: req.body.title},
                            {$push: {"people": newPerson}},
                            {upsert: true, new: true, multi: false},
                            function (err, skill) {
                                if (err) console.log(err);
                                if (skill) console.log(skill);
                            });
                    }
                });
            });
    }
};

// update level
module.exports.editSkill = function(req, res, next){
    console.log('edit skill ' + req.body.title);
    if (!req.payload._id) {
        console.log(req);
        res.status(401).json({
            "message" : "UnauthorizedError: private profile"
        });
    } else {
        // Check if the user exist
        User
            .findById(req.payload._id)
            .exec(function (err, user) {
                const u = new User(user);
                Person.findOne({'username': u.username}).exec(function (err, person) {

                    const skill = req.body;

                    // Check if the person already has the skill
                    personSkills = person.skills.filter(function(s){
                        return s.title === skill.title;
                    });

                    // person does not have the skill, therefore we cannot update
                    if (personSkills.length == 0) {
                        res.status(409).json({
                            "message" : person.username + " does not have " + req.body.title
                        });
                    }
                    else {
                        // update the server document

                        //Remove the old skill from the array (check if there's a better way to do so)
                        personSkills = person.skills.filter(function(s){
                            return s.title != skill.title;
                        });

                        // Push the new skill
                        personSkills.push(skill);

                        // update the skills of the person object
                        person.skills = personSkills;
                        console.log(person.skills);

                        // Replace the updated person object into the collection
                        Person.findOneAndUpdate({username: person.username},
                                                {$set: {"skills":person.skills}},
                                                {new : true},
                                                function(err, p){
                            if (err) console.log(err);
                            // old object for some reason
                            if (p) {
                                res.status(200).json(p);
                            }
                        });

                        /*
                        // update the skill document
                        const newPerson = {
                            username: person.username,
                            level: req.body.level
                        }
                        // update the skill document
                        Skill.findOneAndUpdate({title: req.body.title},
                            {$push: {"people": newPerson}},
                            {upsert: true, new: true, multi: false},
                            function (err, skill) {
                                if (err) console.log(err);
                                if (skill) console.log(skill);
                            });
                            */
                    }
                });
            });
    }
};
// change password
