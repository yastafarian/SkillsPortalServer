const Person = require('../models/person');
const Skill = require('../models/skill');
const User = require('../models/user');

//Helper functions

//Update a certain skill
function updateSkillCollection(skill, person){

    Skill.findOneAndUpdate({title: skill.title},
        {upsert: true, new: true}).then(function(s){
        //copy the people inside the skill document
        people = s.people.slice();

        //find the person we want to update within the skill document
        for (var i = 0; i < people.length; i++){
            if (people[i].username == person.username){
                people[i].level = skill.level;
                break;
            }
        }
        // update the skill callback object
        s.people = people;

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


//=== Route functions ===

module.exports.getAll = function(req, res, next){
    console.log('GET /people');
    Person.find({}).then(function(people){
        res.send(people);
    });
};

module.exports.getByUserName = function(req, res, next){
    console.log('GET /people/users/' + req.params.username);
    Person.find({username: req.params.username}).then(function(people){
        res.send(people);
    });
};

module.exports.getBySkill = function(req, res, next){
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
};

module.exports.updateSkills =  function(req, res, next){
    console.log('PUT /people/update_skills/' + req.params.username);
    // create the skill JSON variable
    var request = req.body;
    var toUpdate = {
        title: request.title,
        level: request.level
    };

    //Find the the person
    Person.findOne({username: req.params.username}).then(function(p){
        var personSkills = p.skills.slice();
        var index;
        // Look through the person skills to find if the skill already exists
        console.log('Looking through ' + p.username + ' skills for ' + toUpdate.title);
        for (var i = 0; i < personSkills.length; i++){
            if (personSkills[i].title === toUpdate.title){
                // Found one; log the index
                console.log('found ' + toUpdate.title + ' at index ' + i);
                index = i;
                break;
            }
        }

        // Based on the index variable, we either push a new skill or update an
        // an existing one.
        // index variable can only contain the index of the skill if it exists.
        console.log('index = ' + index);
        if (index === undefined){
            console.log(p.username + ' does not have ' + toUpdate.title + ' skill');
            personSkills.push(toUpdate);
        }
        else{
            personSkills[index] = toUpdate;
        }
        p.skills = personSkills;
        console.log(personSkills);
        console.log(p.skills);
        updateSkillCollection(toUpdate, p);

        // update the person collection
        Person.findOneAndUpdate({username: p.username},
            p,
            {new: true, mutli: false}, function(err, pers){
                if(err){
                    console.log(err);
                }
                res.send(pers);
            });
    });
};

// For future needs
module.exports.remove = function(req, res, next){
    console.log('DELETE /people/' + req.params.username);
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
};

module.exports.add =  function(req, res, next){
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
};