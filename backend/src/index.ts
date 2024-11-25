import path from 'path';
import { GetAllDataService } from './getAllDataService';
import dotenv from 'dotenv';


// load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function run() {
    const getAllDataService = new GetAllDataService();

    try {
        // Call getAllData to start fetching data for all departments
        await getAllDataService.getAllData();

        console.log('Successfully processed all departments.');
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error during data fetching: ${error.message}`);
        } else {
            console.error(`Unknown error occurred:`, error);
        }
    }
}

// Run the function
run();
