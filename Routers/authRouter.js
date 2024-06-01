const express = require('express');

const router = express.Router();

const {getAllUsers, signup} = require('../Controllers/authController');

router
    .get('/', getAllUsers)
    .post('/signup', signup)

module.exports = router;