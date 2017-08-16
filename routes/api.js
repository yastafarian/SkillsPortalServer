const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');

const Person = require('../models/person.js');
const Skill = require('../models/skill.js');

const ctrlPeople = require('../controllers/people');
const ctrlAuth = require('../controllers/authentication');
const ctrlProfile = require('../controllers/profile');
const ctrlSkills = require('../controllers/skills');



var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

//profile routes
router.get('/profile', auth, ctrlProfile.profileRead);

//Authentication routes
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

/*
//Skills routes
router.post('/skills', ctrlSkills.add);
router.put('/skills', ctrlSkills.update);
router.get('/skills', ctrlSkills.getAll);
router.get('/skills/:title', ctrlSkills.get);

//people routes
router.post('/people', ctrlPeople.add);
router.put('/people', ctrlPeople.update);
router.get('/people/skill/:title', ctrPeople.getAllBySkill);
router.get('/people/:username', ctrlSkills.getByUsername);
*/

//Update a certain skill
function updateSkillCollection(skill, person){
  //TODO: if skill doesnt exist create a newone
  Skill.findOneAndUpdate({title: skill.title},
                         {$push: {persons: person}},
                        {upsert: true, new: true}).then(function(s){
    //copy the people inside the skill document
    people = s.persons.slice();

    //find the person we want to update within the skill document
    for (var i = 0; i < people.length; i++){
      if (people[i].username == person.username){
        people[i].level = skill.level;
        break;
      }
    }
    // update the skill callback object
    s.persons = people;

    //find the document again the collection to update it witht he new object
    Skill.findOneAndUpdate({title: s.title},
                            s,
                            {new: true, mutli: false}, function(err, skill){
                              if(err){
                                  console.log(err);
                              }
                            });
  });
}



//==Retrieve methods=======
// all skills
router.get("/skills", function(req, res, next){
  console.log('GET /skills');
  Skill.find({}).then(function(skills){
    res.send(skills);
  });
});

// specific skill
router.get("/skills/:title", function(req, res, next){
  console.log('GET /skills/'+req.params.title);
  Skill.find({title: req.params.title}).then(function(skills){
    res.send(skills);
  });
});

// all people
router.get("/people", function(req, res, next){
  console.log('GET /people');
  Person.find({}).then(function(people){
    res.send(people);
  });
});

// specific person
router.get("/people/users/:username", function(req, res, next){
  console.log('GET /people/users/' + req.params.username);
  Person.find({username: req.params.username}).then(function(people){
    res.send(people);
  });
});

// people with specific skill
router.get("/people/skills", function(req, res, next){
  var skill = {
    title: req.query.title,
    level: req.query.level
  };
  console.log('GET /people/skills' + skill.title);
  if (skill.level === undefined){
    Person.find({skills: {$elemMatch: {title: skill.title}}}).then(function(people){
      res.send(people);
    });
  }
  else {
    Person.find(
      {skills: {$elemMatch: {title: skill.title, level: skill.level}}}).
      then(function(people){
      res.send(people);
    });
  }
});
//===End of Retrieve methods======

//====Update methods==============
router.put("/people/users/:username", function(req, res, next){
  console.log('PUT /people/users' + req.params.username);
  // create the skill JSON variable
  var toUpdate = {
    title: req.query.title,
    level: req.query.level
  };

  //Find the the person
  Person.findOne({username: req.params.username}).then(function(p){
    var personSkills = p.skills.slice();
    var index;
    // Look through the person skills to find if the skill alread exists
    for (var i = 0; i < personSkills.length; i++){
      if (personSkills[i].title == toUpdate.title){
        // Found one; log the index
        index = i;
        break;
      }
    }

    // Based on the index variable, we either push a new skill or update an
    // an existing one.
    // index variable can only contain the index of the skill if it exists.
    if (index === undefined){
      personSkills.push(toUpdate);
      //create new skill
      var newSkill = Skill({
        title: toUpdate.title,
        persons: [{
          username: p.username,
          level: toUpdate.level
        }]
      });
      //newSkill.save().then(function(s){
      //});
    }
    else{
      personSkills[index] = toUpdate;
      //updateSkillCollection(toUpdate, p);
    }
    p.skills = personSkills;
    updateSkillCollection(toUpdate, p);

    // update the person collection
    Person.findOneAndUpdate({username: p.username},
                            p,
                            {new: true, mutli: false}, function(err, pers){
                              if(err){
                                  //console.log(err);
                              }
                              res.send(pers);
                            });
  });
});

//===Create methods=========

// add new Person
router.post("/people", function(req, res, next){
  //TODO: verify & register
  console.log('POST  /people');
  Person.create(req.body).then(function(person){
    //console.log('adding ' + person.username + ' to DB');
    // Add individual skills to DB
    var skills = person.skills.slice();

    for (var i = 0, len = skills.length; i < len; i++){
      //============
      var p = {
        username: person.username,
        level: skills[i].level
      };

      Skill.findOneAndUpdate({title: skills[i].title},
                             {$push: {people: p.username}},
                             { upsert : true, new: true},
                             function(err, skill){});
      //END of forloop
    }
    res.send(person);
  }).catch(next);
});

//===Delete methods=========

// delete a person and remove said person from the corroponding skill documents
router.delete("/people/:username", function(req, res, next){
  Person.findOneAndRemove({username: req.params.username}).then(function(person){
    // Add individual skills to DB
    var skills = person.skills.slice();

    for (var i = 0, len = skills.length; i < len; i++){
      //============
      var p = {
        username: person.username,
        level: skills[i].level
      };

      Skill.findOneAndUpdate({title: skills[i].title},
                             {$pull: {persons: p}},
                             { new: true},
                             function(err, skill){});
      //END of forloop
    }
    res.send(person);
  });
});

// delete one skill
router.delete("/people/deleteSkill/:username", function(req, res, next){
  console.log('delete skill');
  // update the server document
  Person.findOneAndUpdate({username: req.params.username},
                         {$pull: {"skills": {"title": req.query.title}}},
                         { new: true},
                         function(err, person){
                           if (err) console.log(err);
                           if (person) console.log(person);
                         });

  // update the skill document
  Skill.findOneAndUpdate({title: req.query.title},
                         {$pull: {"persons": {"username": req.params.username}}},
                         { new: true},
                         function(err, skill){
                           if (err) console.log(err);
                           if (skill) res.send(skill);
                         });
});

module.exports = router;
