const express = require('express');
const app = express();
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');

const morgan = require('morgan');

const logger = function (req, res, next) {
    console.log('Custom middleware called');
    next();
}
app.use(express.static('public'));
app.use(express.json());
app.use(logger);

if (process.env.NODE_ENVIRONMENT == 'development') {
    app.use(morgan('dev'));
}

const routerJson = require('./Routers/moviesRouterJson');
app.use('/api/v1/json/movies', routerJson);

const moviesRouter = require('./Routers/moviesRouter');
app.use('/api/v1/movies', moviesRouter);

const authRouter = require('./Routers/authRouter');
app.use('/api/v1/users', authRouter);

app.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server`, 404);
    next(err);
})

app.use(globalErrorHandler);

module.exports = app;

