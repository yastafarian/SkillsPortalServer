const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Person = new Schema({
  username: String,
  level: String
}, {_id: false});


const SkillSchema = new Schema({
  title: {
      type: String,
      required: [true, 'Name field is required'],
      lowercase: true,
      trim: true
  },
  people: [Person]
});

const Skill = mongoose.model('skill', SkillSchema);

module.exports = Skill;
