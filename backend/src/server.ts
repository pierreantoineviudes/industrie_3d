// Import the 'express' module
import express from 'express';
import { GetDataService } from './getDataService';
import dotenv from 'dotenv';
import * as path from 'path';

// load env variables
dotenv.config({path: path.resolve(__dirname, "../.env")});
console.log("env : ", process.env);

// Create an Express application
const app = express();

// Set the port number for the server
const port = 3000;

// create service to get data
const dataService = new GetDataService;

// Define a route for the root path ('/')
app.get('/', async (req, res) => {
    // Send a response to the client
    const data = await dataService.getData();
    Promise.all(data).then(
        (datas: any) => {
            console.log(datas.data);
        }
    )
    res.json(data);
});

// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});