const fs = require('fs');
const moviesJson = fs.readFileSync('./Data/movies.json') // basically importing/reading the movies.json file.
// console.log(moviesJson); // logs the movies in json format

const moviesArray = JSON.parse(moviesJson); // JSON.parse converts json data into
// javascript object.
// console.log(moviesArray) // logs the movies as an array of objects.

const checkId = (req, res, next, value) => {
    const theMovie = moviesArray.find((element) => element.id == value);
    if (!theMovie) {
        return res.status(404).json({
            status: 'fail',
            message: `data with id ${value} not found`
        })
    }
    next();
}

const checkBody = (req, res, next) => {
    const { title, releaseYear, ...rest } = req.body;
    if (!title || !protagonist || !rest) {
        return res.json({
            status: "failed",
            message: "invalid data"
        })
    }
    if ((Object.keys(req.body)).length > 3) { // if object keys exceed length of 3, it means there are fields other than the ones 
        return res.json({
            status: "failed",
            message: "invalid data: extra fields present"
        })
    }
    next();
}

const getAllMovies = (req, res) => {
    res.status(200).json({ // res.json ends the request-response cycle. it is the last middleware.
        status: "success",
        count: moviesArray.length,
        data: moviesArray
    });
    // could've gone with just res.status(200).json(moviesArray)
}

const getMovieById = (req, res) => {
    
    const { id } = req.params;

    try {
        const theMovie = moviesArray.find((element) => element._id == id);
        res.status(200).json(theMovie);
    } catch (error) {
        res.status(401).json({
            status: 'failed',
            message: error.message
        })
    }
}

const postMovie = (req, res) => {
    try {
        const newMovie = {
            id: (moviesArray[moviesArray.length - 1]._id) + 1,
            ...req.body
        }
        moviesArray.push(newMovie); // first we add that new movie to the moviesArray/Array.
        fs.writeFile('./Data/movies.json', JSON.stringify(moviesArray), (err) => {
            res.status(201).json(newMovie);
        }) // then we rewrite the movies.json file so that new movie is accounted for.
    } catch (error) {
        console.log(error);
    }
    // Before writing to the file, the code appends a new movie object to the moviesArray array. This is done to include the new movie in the array of movies before writing it back to the file. If you were to directly write the moviesArray array to the file without appending the new movie, you would overwrite the existing data with the old data, effectively losing the new movie.
}

const patchMovie = (req, res) => {
    const { id } = req.params;
    const movieToUpdate = moviesArray.find((el) => el._id == id);
    const indexOfThatMovie = moviesArray.indexOf(movieToUpdate);

    Object.assign(movieToUpdate, req.body); // does the editing.
    moviesArray[indexOfThatMovie] = movieToUpdate;

    fs.writeFile('./Data/movies.json', JSON.stringify(moviesArray), (err) => {
        console.log(err);
    });
    res.json(movieToUpdate);
}

const deleteMovie = (req, res) => {
    const { id } = req.params;
    const movieToDelete = moviesArray.find((el) => el._id == id);
    const index = moviesArray.indexOf(movieToDelete);

    moviesArray.splice(index, 1);

    for (let i = 0; i < moviesArray.length; i++) {
        moviesArray[i].id = i + 1;
    }

    fs.writeFile('./Data/movies.json', JSON.stringify(moviesArray), (err) => {
        if (err) {
            console.log(err);
        }
    });

    res.status(204).json({
        status: "success",
        movie: null
    })
}

// All of the code above is working with the movies.json file, those API's (controllers, functions, whatever you want to call it) are operating on movies.json file, deleting objects, creating new objects, updating, etc.

module.exports = {
    getAllMovies,
    getMovieById,
    postMovie,
    patchMovie,
    deleteMovie,
    checkId,
    checkBody
}