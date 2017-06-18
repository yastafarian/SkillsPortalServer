const express = require('express');
const router = express.Router();
const Person = require('../models/person.js');
const Skill = require('../models/skill.js');


//in the case of updating the level
function updateSkillCollection(skill, person){
  Skill.findOne({title: skill.title}).then(function(s){
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
    Person.findOneAndUpdate({title: s.title},
                            s,
                            {new: true, mutli: false}, function(err, person){
                              if(err){
                                  console.log("Something wrong when updating data!");
                              }
                              res.send(s);
                            });
  });
}



//==Retrieve methods=======
// all skills
router.get("/skills", function(req, res, next){
  Skill.find({}).then(function(skills){
    res.send(skills);
  });
});

// specific skill
router.get("/skills/:title", function(req, res, next){
  Skill.find({title: req.params.title}).then(function(skills){
    res.send(skills);
  });
});

// all people
router.get("/people", function(req, res, next){
  Person.find({}).then(function(people){
    res.send(people);
  });
});

// specific person
router.get("/people/users/:username", function(req, res, next){
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
  if (skill.level === undefined){
    Person.find({skills: {$elemMatch: {title: skill.title}}}).then(function(people){
      res.send(people);
    });
  }
  else {
    Person.find({skills: {$elemMatch: {title: skill.title, level: skill.level}}}).then(function(people){
      res.send(people);
    });
  }
});
//===End of Retrieve methods======

//====Update methods==============

//TODO: update existing skill for a person => update corrosponding skill
//TODO: push new skill for a person => update corrosponding skill
//TODO: delete skill => update corrosponding skill
router.put("/people/addskill/:username", function(req, res, next){
  var skill = {
    title: req.query.title,
    level: req.query.level
  };
  Person.findOne({username: req.params.username}).then(function(p){
    var skills = p.skills.slice();
    var index;
    for (var i = 0; i < skills.length; i++){
      console.log('searching ' + i);
      if (skills[i].title == skill.title){
        console.log('searching ' + i);
        index = i;
        break;
      }
    }
    if (index === undefined){
      console.log('pushing skill');
      skills.push(skill);
    }
    else{
      skills[index] = skill;
      updateSkillCollection(skill, p);
    }
    p.skills = skills;

    Person.findOneAndUpdate({username: req.params.username},
                            p,
                            {new: true, mutli: false}, function(err, person){
                              if(err){
                                  console.log("Something wrong when updating data!");
                              }
                              res.send(person);
                            });
  });

});


//===Create methods=========

// add new Person
router.post("/people", function(req, res, next){
  //TODO: verify & register
  Person.create(req.body).then(function(person){
    console.log('adding ' + person.username + ' to DB');

    // Add individual skills to DB
    var skills = person.skills.slice();

    for (var i = 0, len = skills.length; i < len; i++){
      //============
      var p = {
        username: person.username,
        level: skills[i].level
      };

      Skill.findOneAndUpdate({title: skills[i].title},
                             {$push: {persons: p}},
                             { upsert : true, new: true},
                             function(err, skill){});
      //END of forloop
    }
    res.send(person);
  }).catch(next);
});


module.exports = router;
