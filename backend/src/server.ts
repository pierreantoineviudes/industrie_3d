// Import the 'express' module
import express from 'express';
import { GetDataService } from './getDataService';
import dotenv from 'dotenv';
import * as path from 'path';
import proj4 from 'proj4';
import cors from 'cors';


// load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// define projection lambert
proj4.defs('EPSG:9794', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs +type=crs');

// Create an Express application
const app = express();

// Use CORS middleware
app.use(cors());

// Set the port number for the server
const port = 3000;

// create service to get data
const dataService = new GetDataService;

// Define a route for the root path ('/')
app.get('/', async (req, res) => {
    // Send a response to the client
    const data = await dataService.getData('62');
    const coords: any[] = [];
    await Promise.all(data).then(
        (datas: any) => {
            datas.forEach((data: {
                data: any; status: any;
            }) => {
                const etablissements = data.data.etablissements;
                etablissements.forEach((etablissement: { adresseEtablissement: any; }) => {
                    const x = etablissement.adresseEtablissement.coordonneeLambertAbscisseEtablissement;
                    const y = etablissement.adresseEtablissement.coordonneeLambertOrdonneeEtablissement;
                    if (x !== null && y !== null && x !== '[ND]' && y !== '[ND]') {
                        coords.push([x, y]);
                    }
                });
            });
        }
    )
    coords.filter((val) => val !== null);
    const mappedValues = coords.map((value) => {
        const x = parseFloat(value[0]);
        const y = parseFloat(value[1]);
        const projetes = proj4('EPSG:9794', 'EPSG:4326', [x, y])
        return {
            'lat': projetes[1],
            'lng': projetes[0],
        }
    });
    res.json(mappedValues);
});

// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});