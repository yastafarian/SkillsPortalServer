const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');


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
router.delete("/profile/delete_skill/:skill", auth, ctrlProfile.deleteSkill);
router.put("/profile/add_skill", auth, ctrlProfile.addSkill);
router.put("/profile/edit_skill", auth, ctrlProfile.editSkill);

//Authentication routes
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);


//Skills routes
router.get('/skills', ctrlSkills.getAll);
router.get('/skills/:title', ctrlSkills.getByTitle);


//people routes
router.get("/people", ctrlPeople.getAll);
router.get("/people/:username", ctrlPeople.getByUserName);
router.get("/people/skill", ctrlPeople.getBySkill);

router.put("/people/update_skills/:username", ctrlPeople.updateSkills);

router.post("/people", ctrlPeople.add);
router.delete("/people/:username", auth, ctrlPeople.remove);


module.exports = router;
