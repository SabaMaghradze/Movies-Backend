const User = require('../Models/userModel');
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const {signToken, sendResponse} = require('./authController');

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

    sendResponse(user, 200, res);
});

const updateMe = asyncErrorHandler(async (req, res, next) => {
   if (req.body.password || req.body.confirmPassword) {
       return next(new CustomError(`You cannot update your password using this endpoint`, 400));
   }
   if (req.body.role) {
       return next(new CustomError(`You cannot amend your role`, 401));
   }
   const filteredReqBody = filterReqBody(req.body, 'name', 'email');
   const user = await User.findByIdAndUpdate(req.user.id, filteredReqBody, {runValidators: true, new: true});
   // Where does the user come from? protect middleware which is run before this middleware.
    sendResponse(user, 200, res);
});

const deleteMe = asyncErrorHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, {active: false});

    sendResponse(user, 204, res)
})

module.exports = {updatePassword, updateMe, deleteMe};