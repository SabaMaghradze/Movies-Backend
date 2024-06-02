const Movie = require('../Models/movieModel');
const ApiUtils = require('../Utils/ApiFeatures');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');

const testApi = asyncErrorHandler(async (req, res) => {

})

const postMovie = asyncErrorHandler(async (req, res) => {
    const movie = await Movie.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            movie
        }
    })
})

const getHighestRated = asyncErrorHandler(async (req, res, next) => {
    req.query.limit = '5';
    next();
})

const getAllMovies = asyncErrorHandler(async (req, res) => {
    const features = new ApiUtils(Movie.find(), req.query).filter().sort().limitFields().paginate();
    const movies = await features.queryObj;

    res.status(200).json({
        status: 'success',
        length: movies.length,
        movies: movies
    });
})

const getMovieById = asyncErrorHandler(async (req, res, next) => {
    // This 'id' comes from moviesRouter.js ('/:id').
    const movie = await Movie.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        movie: movie
    })
})

const updateMovie = asyncErrorHandler(async (req, res) => {
    const {id} = req.params;
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    if (!updatedMovie) {
        const err = new CustomError(`Movie with that ID not found`, 404);
        return next(err);
    }

    res.status(200).json({
        status: "success",
        movie: updatedMovie
    })
})

const deleteMovie = asyncErrorHandler(async (req, res) => {
    const {id} = req.params;
    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
        const err = new CustomError(`Movie with that ID not found`, 404);
        return next(err);
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})

const getMovieStats = asyncErrorHandler(async (req, res) => {
    const stats = await Movie.aggregate([
        {$match: {releaseYear: {$gte: 2010}}},
        {
            $group: {
                _id: '$releaseYear', // going to return movie stats for each year.
                avgRating: {$avg: '$rating'}, // average rating of movies made in particular year.
                totalMovies: {$sum: 1}
            }
        },
        {$sort: {_id: 1}}
    ]);

    res.status(200).json({
        status: 'success',
        count: stats.length,
        data: stats
    })
})

const getMoviesByGenre = asyncErrorHandler(async (req, res) => {
    const {genre} = req.params;
    const movies = await Movie.aggregate([
        {$unwind: '$genres'}, // destructures the array.
        {
            $group: {
                _id: '$genres',
                movieCount: {$sum: 1},
                moviesOfThatGenre: {$push: '$title'}
            }
        },
        {$addFields: {genre: '$_id'}},// basically says add genre field and assign whateverValue _id has
        {$project: {_id: 0}}, // specifies which fields to show, this time we say don't show _id.
        {$match: {genre: genre}} // get movies only of that genre (req.param.genre)

    ]);
    res.status(200).json({
        status: 'success',
        length: movies.length,
        data: movies
    })
})

module.exports = {
    testApi,
    getAllMovies,
    postMovie,
    getMovieById,
    updateMovie,
    deleteMovie,
    getHighestRated,
    getMovieStats,
    getMoviesByGenre
}
