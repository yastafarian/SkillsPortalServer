const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SkillSchema = new Schema({
  title: {
      type: String,
      required: [true, 'Title field is required'],
      lowercase: true,
      trim: true
  },
  level: {
    type: String,
    defualt: 'beginner',
    lowercase: true,
    trim: true
  }
},{ _id : false });

const PersonSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name field is required']
  },
  username: {
    type: String,
    required: [true, 'username field is required'],
    lowercase: true,
    unique: true,
    trim: true
  },
  skills: [SkillSchema]
});

const Person = mongoose.model('person', PersonSchema);

module.exports = Person;
