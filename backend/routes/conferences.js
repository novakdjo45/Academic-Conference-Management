const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');

router.get('/', conferenceController.getAllConferences);
router.get('/:id', conferenceController.getConferenceById);
router.post('/', conferenceController.createConference);
router.delete('/:id', conferenceController.deleteConference);

module.exports = router;
