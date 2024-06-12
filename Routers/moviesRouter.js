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
    .get('/', protect, getAllMovies)
    .get('/movie-stats', getMovieStats)
    .get('/movies-by-genre/:genre', getMoviesByGenre)
    .post('/', postMovie)
    .get('/:id', getMovieById)
    .patch('/:id', updateMovie)
    .delete('/:id', protect, restrict('admin'), deleteMovie)

module.exports = router;    