const express = require('express');
const router = express.Router();
const Person = require('../models/person.js');
const Skill = require('../models/skill.js');


//Update a certain skill
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
    Person.find(
      {skills: {$elemMatch: {title: skill.title, level: skill.level}}}).
      then(function(people){
      res.send(people);
    });
  }
});
//===End of Retrieve methods======

//====Update methods==============
//TODO: delete skill => update corrosponding skill
router.put("/people/updateSkills/:username", function(req, res, next){
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
      newSkill.save().then(function(s){
      });
    }
    else{
      personSkills[index] = toUpdate;
      updateSkillCollection(toUpdate, p);
    }
    p.skills = personSkills;

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
