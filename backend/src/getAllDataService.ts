import proj4 from 'proj4';
import { GetDataService } from './getDataService';
import path from 'path';
import * as fs from 'fs';

// define projection lambert
proj4.defs('EPSG:9794', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs +type=crs');

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


export class GetAllDataService {

    async getAllData() {
        const dataService = new GetDataService();
        const retryCount = 3; // Number of retries
        const delay = 2000; // Delay between each individual API call in milliseconds
        const maxDepartments = 95; // Total number of departments (from 01 to 95)

        // Process departments in batches of 3
        for (let i = 1; i <= maxDepartments; i += 2) {
            const batch = [];
            // Create a batch of 3 department promises
            for (let j = 0; j < 2 && i + j < maxDepartments; j++) {
                const department = (i + j).toString().padStart(2, '0'); // Ensure department code is two digits
                batch.push(this.fetchDepartmentData(department, retryCount, delay));
            }

            // Wait for all departments in the current batch to be processed
            await Promise.all(batch);
            console.log(`Batch of ${batch.length} departments processed, waiting before next batch...`);

            // Wait for 1 minute before processing the next batch of departments
            if (i + 3 < maxDepartments) { // Don't wait after the last batch
                await new Promise(resolve => setTimeout(resolve, 60000)); // 60 seconds delay
            }
        }
    }

    // Fetch data for a single department with retry mechanism
    async fetchDepartmentData(department: string, retryCount: number, delay: number) {
        let attempts = 0;
        while (attempts < retryCount) {
            try {
                console.log(`Fetching data for department ${department}...`);
                const data = await new GetDataService().getData(department);
                console.log(`Data fetched for department ${department}`);
                // Process and save data here if needed
                const coords: any[] = [];
                await Promise.all(data).then(
                    (datas: any) => {
                        datas.forEach((data: {
                            data: any; status: any;
                        }) => {
                            const etablissements = data.data.etablissements;
                            etablissements.forEach((etablissement: {
                                uniteLegale: any; adresseEtablissement: any;
                            }) => {
                                const x = etablissement.adresseEtablissement.coordonneeLambertAbscisseEtablissement;
                                const y = etablissement.adresseEtablissement.coordonneeLambertOrdonneeEtablissement;
                                const trancheEffectifsUniteLegale = etablissement.uniteLegale.trancheEffectifsUniteLegale;
                                if (x !== null && y !== null && x !== '[ND]' && y !== '[ND]') {
                                    coords.push(
                                        {
                                            'lat': x,
                                            'lon': y,
                                            'taille': trancheEffectifsUniteLegale,
                                        }
                                    );
                                }
                            });
                        });
                    }
                )
                coords.filter((val) => val !== null);
                const mappedValues = coords.map((value) => {
                    const x = parseFloat(value['lat']);
                    const y = parseFloat(value['lon']);
                    const projetes = proj4('EPSG:9794', 'EPSG:4326', [x, y])
                    // ici il faut convertir la taille avec le bon dictionnaire avant de
                    // le return
                    const tailleKey: string = value["taille"];
                    return {
                        'lat': projetes[1],
                        'lng': projetes[0],
                        'taille': tailleDict[tailleKey],
                    }
                });

                // c'est ici qu'il faut save les mappedValues
                // console.log("mapped values : ", mappedValues);
                const mappedValuesString = JSON.stringify(mappedValues);
                // console.log("mappedValuesString : ", mappedValuesString);
                fs.writeFile(path.join(__dirname, `/data/departements/${department}.json`), mappedValuesString, (err: any) => console.error(err));
                return data; // You can save the data here if needed
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error fetching data for department ${department}: ${error.message}`);
                } else {
                    console.error(`Unknown error occurred for department ${department}:`, error);
                }
                attempts++;

                if (attempts < retryCount) {
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay)); // Delay before retrying
                } else {
                    console.log(`Failed to fetch data for department ${department} after ${attempts} attempts.`);
                }
            }
        }
    }
}
