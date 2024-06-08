const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, "Please provide email address"],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address."]
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please enter password"],
        minlength: 8,
        select: false // excludes this field from response body. if we getAllUsers, passowrds will not be shown
    },
    passwordChangedAt: Date,
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        select: false,
        validate: {
            // only works for save() and create() methods. findOneAndUpdate would not work.
            validator: function(value) {
                return value == this.password; // checks whether password and confirmpassword values
                // coincide.
            },
            message: "Can't confirm password"
        }
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.comparePasswords = async function(password, passwordInDB) {
    return await bcrypt.compare(password, passwordInDB);
}

userSchema.methods.changedPassword = async function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const timestampActual = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return await JWTTimestamp < timestampActual;
    }
    return false;
}

const User = mongoose.model('user', userSchema, 'users');

module.exports = User;