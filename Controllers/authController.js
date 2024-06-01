const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const ApiUtils = require('../Utils/ApiFeatures');

const signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    })
})

const getAllUsers = asyncErrorHandler(async (req, res) => {
    const features = new ApiUtils(User.find(), req.query).filter().sort().limitFields().paginate();
    const users = await features.queryObj;

    res.status(200).json({
        status: 'success',
        length: users.length,
        users: users
    });

})

module.exports = {getAllUsers, signup};