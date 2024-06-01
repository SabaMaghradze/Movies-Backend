const express = require('express');
const router = express.Router();

const {
    getAllMovies,
    getMovieStats,
    postMovie,
    getMovieById,
    updateMovie,
    deleteMovie,
    testApi,
    getHighestRated,
    getMoviesByGenre
} = require('../Controllers/moviesController');

router
    .get('/highest-rated', getHighestRated, getAllMovies)
    .get('/testapi', testApi)
    .get('/', getAllMovies)
    .get('/movie-stats', getMovieStats)
    .get('/movies-by-genre/:genre', getMoviesByGenre)
    .post('/', postMovie)
    .get('/:id', getMovieById)
    .patch('/:id', updateMovie)
    .delete('/:id', deleteMovie)

module.exports = router;    