const CustomError = require('../Utils/CustomError');

const devErrors = (error, res) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
    })
}

const prodErrors = (error, res) => {
    if (error.isOperational) { // not all the errors will be operational, some of the errors are generated
        // by mongoose, such as validation.
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        })
    } else {
        res.status(500).json({
            status: 'failed',
            message: "Something went wrong! Please try again later."
        })
    }
}

const handleInvalidID = (err) => {
    const msg = `Invalid value (${err.path}): ${err.value}.`;
    return new CustomError(msg, 404);
}

const handleDuplicateKeys = (err) => {
    const msg = `Movie with title "${err.keyValue.title}" already exists.`;
    return new CustomError(msg, 400);
}

const tokenExpirationError = (err) => {
    return new CustomError(`JWT has expired, please log in again`, 401);
}

const globalErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (error.name == 'CastError')  error = handleInvalidID(error);
    if (error.code == 11000) error = handleDuplicateKeys(error);
    if (error.name == "TokenExpiredError") error = tokenExpirationError(error);


    if (process.env.NODE_ENVIRONMENT == 'development') {
        devErrors(error, res);
    } else if (process.env.NODE_ENVIRONMENT == 'production') {
        prodErrors(error, res);
    }
}

// if the node environment is production, do not leak unnecessary error details to the client,
// keep it as simple as possible.

module.exports = globalErrorHandler;