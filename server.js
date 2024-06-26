const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // this line of code should always come before const app = require('./app')

const app = require('./app');
const connectToDatabase = require('./dbConnection');

const port = process.env.PORT;

const startServer = async () => {
    try {
        await connectToDatabase(process.env.MONGOURI);
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
        // Optionally, you can choose to exit the process if the database connection fails
        process.exit(1);
    }
}

startServer();

// process.on('unhandledRejection', (error) => {
//     console.log(error.message);
//     console.log("Unhandled rejection occurred, shutting down...");
//     app.close(() => {
//         process.exit(1);
//     });
// })