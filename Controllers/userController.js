const User = require('../Models/userModel');
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const {signToken} = require('./authController');

function filterReqBody(obj, ...permittedFields) {
    let result = {};
    Object.keys(obj).forEach(prop => {
        if (permittedFields.includes(prop)) {
            result[prop] = obj[prop];
        }
    })
    return result;
}

const updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePasswords(req.body.currentPassword, user.password))) {
        return next(new CustomError(`The current password you provided is wrong`, 401));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
});

const updateMe = asyncErrorHandler(async (req, res, next) => {
   if (req.body.password || req.body.confirmPassword) {
       return next(new CustomError(`You cannot update your password using this endpoint`, 400));
   }
   const filteredReqBody = filterReqBody(req.body, 'name', 'email');
   const user = await User.findByIdAndUpdate(req.user._id, filteredReqBody, {runValidators: true, new: true});
   // Where does the user come from? protect middleware which is run before this middleware.
    res.status(200).json({
        status: 'success',
        user: {
            user
        }
    })
});

const deleteMe = asyncErrorHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})

module.exports = {updatePassword, updateMe, deleteMe};