const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');

router.get('/', paperController.getAllPapers);
router.get('/:id', paperController.getPaperById);
router.post('/', paperController.createPaper);
router.delete('/:id', paperController.deletePaper);

module.exports = router;
