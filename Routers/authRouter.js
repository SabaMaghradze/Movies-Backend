const express = require('express');

const router = express.Router();

const {
    signUp,
    logIn,
    forgotPassword,
    resetPassword,
} = require('../Controllers/authController');

router
    .post('/signup', signUp)
    .post('/login', logIn)
    .post('/forgotPassword', forgotPassword)
    .patch('/resetPassword/:token', resetPassword)

module.exports = router;