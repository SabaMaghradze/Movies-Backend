const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendMail = require('../Utils/email');
const crypto = require('crypto');

function signToken(id) {
    return jwt.sign({id}, process.env.SECRET_STRING, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

function sendResponse(user, statusCode, res) {
    const token = signToken(user._id);

    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }

    if (process.env.NODE_ENVIRONMENT == 'production') {
        options.secure = true;
    }

    res.cookie('jwt', token, options);

    user.password = undefined; // so that password is not visible in the response body, note that
    // we are not saving the user so the password will be intact in the database(not undefined).

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
     })
}

const signUp = asyncErrorHandler(async (req, res, next) => {

    const newUser = await User.create(req.body);

    sendResponse(newUser, 201, res);
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

    sendResponse(user, 200, res);
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
});

const restrict = () => {
    return (req, res, next) => {
        if (req.user.role !== 'admin') {
            const error = new CustomError(`You are not authorized to perform this action`, 403);
            next(error);
        }
        next();
    }
}

const forgotPassword = asyncErrorHandler(async (req, res, next) => {

    const {email} = req.body;
    const user = await User.findOne({email: email});

    if (!user) {
        const error = new CustomError(`We couldn't find user with the given email`, 404);
        next(error);
    }

    const resetToken = await user.generateResetToken();

    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request, please use the link below to reset the password\n\n${resetUrl}\n\n`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Password change request received',
            message: message
        });
        res.status(200).json({
            status: "success",
            message: "email sent successfully"
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave: false})
        console.log(err)

        return next(new CustomError(`There was an error sending password reset email to user`, 500));
    }

})

const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}});

    if (!user) {
        const error = new CustomError(`Token is invalid or has expired`, 400);
        next(error);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    user.passwordChangedAt = Date.now();

    user.save();

    // re-log in the user.
    sendResponse(user._id, 200, res);
});

module.exports = {signUp, logIn, protect, restrict, forgotPassword, resetPassword, signToken, sendResponse};

















