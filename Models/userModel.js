const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please enter password"],
        minlength: 8,
        select: false // excludes this field from response body. if we getAllUsers, passwords will not be shown
    },
    passwordChangedAt: Date,
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        select: false,
        validate: {
            // only works for save() and create() methods. Wouldn't work for, say findOneAndUpdate.
            validator: function(value) {
                return value == this.password;
            },
            message: "Can't confirm password"
        }
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date
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

userSchema.methods.generateResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('user', userSchema, 'users');

module.exports = User;