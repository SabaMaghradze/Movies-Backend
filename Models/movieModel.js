const mongoose = require('mongoose');
const fs = require('fs');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Must provide the name of the movie'],
        unique: [true, 'Movie with that title already exists'], // meaning the name of the movie must be unique, no two movies should have the same title.
        trim: true
    },
    releaseYear: {
        type: Number,
        required: [true, 'Must provide the release year of the movie']
    },
    director: {
        type: [String],
        required: [true, 'Must provide director']
    },
    cast: {
        type: [{
            actor: {
                type: String,
                required: [true, "Must provide actor's name"]
            },
            character: {
                type: String,
            }
        }],
        required: [true, 'Must provide actors']
    },
    genres: {
        type: [String],
        required: [true, 'Must provide genres']
    },
    rating: {
        type: Number,
        validate: {
            validator: function(value) {
                return value >= 1 && value <= 10;
            },
            message: `The rating must range between 1 and 10`
        }
    },
    totalRatings: {
        type: Number
    },
    coverImage: {
        type: String, // because we will be using path of the image file.
        required: [true, 'Must provide cover image']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {toJSON: {virtuals: true}}, {toObject: {virtuals: true}})

movieSchema.set('validateBeforeSave', true);

movieSchema.virtual('depreciatedRating').get(function () {
    return this.rating - 1;
})

movieSchema.pre('save', function (next) {
    console.log(this);
    next();
})

movieSchema.post('save', function (doc, next) {
    const content = `A new movie has been created with the title of ${this.title}`;
    fs.writeFileSync('log.txt', content, {flag: 'a'}, (err) => {
        console.log(err);
    })
    next();
})

movieSchema.pre(/^find/, function (next) {
    this.find({releaseYear: {$lte: 2024}});
    next();
})

const Movie = mongoose.model('Movie', movieSchema, 'moviesCol');

module.exports = Movie;