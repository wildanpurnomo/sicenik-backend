const express = require('express');
const router = express.Router();
const controller = require('./questionController');

router.post('/qamatch', controller.createQuestion);

router.get('/qamatch', controller.fetchAllQuestions);

module.exports = router;