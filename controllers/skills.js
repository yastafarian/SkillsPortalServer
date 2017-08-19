const mongoose = require('mongoose');
const User = require('../models/user');
const Person = require('../models/person');
const Skill = require('../models/skill');

module.exports.getAll = function(req, res, next){
    console.log('GET /skills');
    Skill.find({}).then(function(skills){
        res.send(skills);
    });
};

module.exports.getByTitle = function(req, res, next){
    console.log('GET /skills/' + req.params.title);
    Skill.find({title: req.params.title}).then(function(skills){
        res.send(skills);
    });
};