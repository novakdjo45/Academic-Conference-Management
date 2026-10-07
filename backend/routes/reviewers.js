const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController');

router.get('/', reviewerController.getAllReviewers);
router.get('/:id', reviewerController.getReviewerById);
router.post('/', reviewerController.createReviewer);
router.delete('/:id', reviewerController.deleteReviewer);

module.exports = router;
