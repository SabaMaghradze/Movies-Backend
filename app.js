const express = require('express');
const app = express();
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');
const rateLimiter = require('express-rate-limit');
const sanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');

const morgan = require('morgan');

const logger = function (req, res, next) {
    console.log('Custom middleware called');
    next();
}

const limit = rateLimiter({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'We have received too many requests from that IP address, please try again after 1 hour.'
})

app.use(helmet());
app.use('/api', limit);
app.use(express.json({limit: '10kb'}));
app.use(sanitize());
app.use(xss());
app.use(logger);

app.use(express.static('public'));

if (process.env.NODE_ENVIRONMENT == 'development') {
    app.use(morgan('dev'));
}

const routerJson = require('./Routers/moviesRouterJson');
app.use('/api/v1/json/movies', routerJson);

const moviesRouter = require('./Routers/moviesRouter');
app.use('/api/v1/movies', moviesRouter);

const authRouter = require('./Routers/authRouter');
app.use('/api/v1/auth', authRouter);

const userRouter = require('./Routers/userRouter');
app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server`, 404);
    next(err);
})

app.use(globalErrorHandler);

module.exports = app;

