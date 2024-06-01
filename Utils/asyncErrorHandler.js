const asyncErrorHandler = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err));
        // if error occurs, this error object will be passed to global error handling middleware that
        // we created, so it will take care of status code, etc.
    }
}

module.exports = asyncErrorHandler;