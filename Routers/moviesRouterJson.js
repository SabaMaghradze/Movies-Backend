const express = require('express');
const router = express.Router();

const {
    getAllMovies,
    getMovieById,
    postMovie,
    patchMovie,
    deleteMovie,
    checkId,
    checkBody
} = require('../Controllers/moviesControllerJson');

router
    .get('/', getAllMovies)
    .get('/:id', getMovieById)
    .post('/', checkBody, postMovie)
    .patch('/:id', patchMovie)
    .delete('/:id', deleteMovie);

router.param('id', checkId); // this middleware is going to execute only if the endpoint includes 'id' parameter.

module.exports = router;