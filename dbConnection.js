const mongoose = require('mongoose');

const connectToDatabase = async (url) => {
    try {
        const conn = await mongoose.connect(url);
        console.log("Successfully connected to database");
        console.log(conn);
        return conn;
    } catch (err) {
        console.log("Failed to connect to database: " + err);
        throw err; // Throw the error to be caught by the caller
    }
}

module.exports = connectToDatabase;