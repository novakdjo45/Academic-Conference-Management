const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');

router.get('/', decisionController.getAllDecisions);
router.post('/', decisionController.createDecision);
router.delete('/:id', decisionController.deleteDecision);

module.exports = router;
