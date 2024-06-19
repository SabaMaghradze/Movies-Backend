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

const {protect, restrict} = require('../Controllers/authController');

router
    .get('/highest-rated', getHighestRated, getAllMovies)
    .get('/testapi', testApi)
    .get('/', getAllMovies)
    .get('/movie-stats', getMovieStats)
    .get('/movies-by-genre/:genre', getMoviesByGenre)
    .post('/', protect, restrict(), postMovie)
    .get('/:id', getMovieById)
    .patch('/:id', protect, restrict(), updateMovie)
    .delete('/:id', protect, restrict(), deleteMovie)

module.exports = router;    