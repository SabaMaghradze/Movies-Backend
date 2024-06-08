const express = require('express');

const router = express.Router();

const {getAllUsers, signUp, logIn} = require('../Controllers/authController');

router
    .get('/', getAllUsers)
    .post('/signup', signUp)
    .post('/login', logIn)

module.exports = router;