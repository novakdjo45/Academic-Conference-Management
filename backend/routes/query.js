const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.get('/presets', queryController.getDemoQueries);
router.post('/execute', queryController.executeQuery);

module.exports = router;
