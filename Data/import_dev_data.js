// in this file we will be writing logic for loading the movies.json data into the database.
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const connectToDb = require('../dbConnection');

connectToDb(process.env.MONGOURI);

const Movie = require('../Models/movieModel');
const movies = JSON.parse(fs.readFileSync('./Data/movies.json', 'utf-8'));

// In order to delete all the existing data in the database.
const deleteMovies = async (req, res) => {
    try {
        await Movie.deleteMany();
        console.log('Collection cleared successfully');
    } catch (error) {
        console.log(eror);
    }
}

// In order to export all the movies from movies.json to the database. 
const insertMovies = async (req, res) => {
    try {
        await Movie.create(movies);
        console.log('Movies exported successfully');
        console.log(movies.length)
    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2] == '--delete') {
    deleteMovies();
}

if (process.argv[2] == '--export') {
    insertMovies();
}

// This file has nothing to do with the development of our web API, if you want to execute this file and update the database with the data in movies.json, run following commands:
// node ./Data/import_dev_data.js --delete (to delete the movies)
// node ./Data/import_dev_data.js --export (to export the movies)
