const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const ApiUtils = require('../Utils/ApiFeatures');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');

function signToken(id) {
    return jwt.sign({id}, process.env.SECRET_STRING, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const getAllUsers = asyncErrorHandler(async (req, res) => {

    const features = new ApiUtils(User.find(), req.query).filter().sort().limitFields().paginate();
    const users = await features.queryObj;

    res.status(200).json({
        status: 'success',
        length: users.length,
        users: users
    });
})

const signUp = asyncErrorHandler(async (req, res, next) => {

    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    })
})

const logIn = asyncErrorHandler(async (req, res, next) => {

    const {email, password} = req.body;

    if (!email || !password) {
        const error = new CustomError(`Please provide email and password`, 400);
        return next(error);
    }

    const user = await User.findOne({email}).select('+password');

    // const isMatch = await user.comparePasswords(password, user.password);

    if (!user || !(await (user.comparePasswords(password, user.password)))) {
        const error = new CustomError(`Invalid email or password`, 400);
        return next(error);
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        user
    })
})

const protect = asyncErrorHandler(async (req, res, next) => {
    let testToken = req.headers.authorization;
    let token;

    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }

    if (!token) {
        next(new CustomError(`You are not logged in!`, 401));
    }

    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STRING);

    const user = await User.findById(decodedToken.id);

    if (!user) {
        const error = new CustomError(`User with the given token does not exist`, 401);
        next(error);
    }

    if (await user.changedPassword(decodedToken.iat)) {
        const error = new CustomError(`The password has been changed recently, please re-log in`, 401);
        return next(error);
    }
    req.user = user;

    next();
})

module.exports = {getAllUsers, signUp, logIn, protect};

















