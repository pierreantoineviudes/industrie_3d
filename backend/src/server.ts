// Import the 'express' module
import express, { Request, Response } from 'express';
import { GetDataService } from './getDataService';
import dotenv from 'dotenv';
import * as path from 'path';
import proj4 from 'proj4';
import cors from 'cors';
import * as fs from 'fs';
import { json } from 'stream/consumers';


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

interface Dictionary<T> {
    [key: string]: T
}

// create dictionnaire data
let tailleDict: Record<string, number> = {
    "00": 0,
    "01": 1.5,
    "02": 4,
    "03": 7.5,
    "11": 15,
    "12": 35,
    "21": 75,
    "22": 150,
    "31": 225,
    "32": 375,
    "41": 750,
    "42": 1500,
    "51": 3500,
    "52": 7500,
    "53": 10000,
}

// Define a route for the root path ('/')
app.get('/', async (req: Request, res: Response) => {
    // Send a response to the client
    // const departement = parseInt(departementString);
    const departement = req.query.departement;
    const pathDepartement: string = path.resolve(__dirname, `data/departements/${departement}.json`);
    const departementLocalExists: boolean = fs.existsSync(pathDepartement);
    if (departementLocalExists) {
        // load departements local
        const mappedValues = JSON.parse(fs.readFileSync(pathDepartement, 'utf-8'));
        // console.log("mappedvalues loaded : ", mappedValues);
        res.json(mappedValues)
    } else {
        if (departement) {
            console.log(`data for departement ${departement} does not exist`);
            // const data = await dataService.getData(departement);
            // const coords: any[] = [];
            // await Promise.all(data).then(
            //     (datas: any) => {
            //         datas.forEach((data: {
            //             data: any; status: any;
            //         }) => {
            //             const etablissements = data.data.etablissements;
            //             etablissements.forEach((etablissement: {
            //                 uniteLegale: any; adresseEtablissement: any;
            //             }) => {
            //                 const x = etablissement.adresseEtablissement.coordonneeLambertAbscisseEtablissement;
            //                 const y = etablissement.adresseEtablissement.coordonneeLambertOrdonneeEtablissement;
            //                 const trancheEffectifsUniteLegale = etablissement.uniteLegale.trancheEffectifsUniteLegale;
            //                 if (x !== null && y !== null && x !== '[ND]' && y !== '[ND]') {
            //                     coords.push(
            //                         {
            //                             'lat': x,
            //                             'lon': y,
            //                             'taille': trancheEffectifsUniteLegale,
            //                         }
            //                     );
            //                 }
            //             });
            //         });
            //     }
            // )
            // coords.filter((val) => val !== null);
            // const mappedValues = coords.map((value) => {
            //     const x = parseFloat(value['lat']);
            //     const y = parseFloat(value['lon']);
            //     const projetes = proj4('EPSG:9794', 'EPSG:4326', [x, y])
            //     // ici il faut convertir la taille avec le bon dictionnaire avant de
            //     // le return
            //     const tailleKey: string = value["taille"];
            //     return {
            //         'lat': projetes[1],
            //         'lng': projetes[0],
            //         'taille': tailleDict[tailleKey],
            //     }
            // });

            // // c'est ici qu'il faut save les mappedValues
            // // console.log("mapped values : ", mappedValues);
            // const mappedValuesString = JSON.stringify(mappedValues);
            // // console.log("mappedValuesString : ", mappedValuesString);
            // fs.writeFile(path.join(__dirname, `/data/departements/${departement}.json`), mappedValuesString, (err) => console.error(err));
            // res.json(mappedValues);
            res.sendStatus(404);
        }
    }
});

// TODO : faire une route pour avoir toutes les data d'un coup

type Etablissement = {
    lat: number,
    lng: number,
    taille: number
}

app.get('/alldata', async (req: Request, res: Response) => {
    // boucler sur tous les departements pour les fusionner
    let data: Etablissement[] = [];
    for (let i = 0; i < 96; i++) {
        const departement = i.toString().padStart(2, '0');
        const pathDepartement: string = path.resolve(__dirname, `data/departements/${departement}.json`);
        const departementLocalExists: boolean = fs.existsSync(pathDepartement);
        if (departementLocalExists) {
            // load departements local
            const mappedValues = JSON.parse(fs.readFileSync(pathDepartement, 'utf-8'));
            data = [...data, ...mappedValues]
            // console.log("mappedvalues loaded : ", mappedValues);
        } else {
            console.log(`departement ${i} n'est pas en stock`);
        }
    }
    res.json(
        data
    );
});

app.use((req, res, next) => {
    console.log(`Unhandled route: ${req.method} ${req.url}`);
    next();
});


// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});