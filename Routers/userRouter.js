const express = require('express');
const router = express.Router();

const {updatePassword, updateMe, deleteMe} = require('../Controllers/userController');
const {protect} = require('../Controllers/authController');

router
    .patch('/updatePassword', protect, updatePassword)
    .patch('/updateMe', protect, updateMe)
    .delete('/deleteMe', protect, deleteMe)


module.exports = router;