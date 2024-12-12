"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllDataService = void 0;
const proj4_1 = __importDefault(require("proj4"));
const getDataService_1 = require("./getDataService");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
// define projection lambert
proj4_1.default.defs('EPSG:9794', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs +type=crs');
// create dictionnaire data
let tailleDict = {
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
};
class GetAllDataService {
    getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataService = new getDataService_1.GetDataService();
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
                yield Promise.all(batch);
                console.log(`Batch of ${batch.length} departments processed, waiting before next batch...`);
                // Wait for 1 minute before processing the next batch of departments
                if (i + 3 < maxDepartments) { // Don't wait after the last batch
                    yield new Promise(resolve => setTimeout(resolve, 60000)); // 60 seconds delay
                }
            }
        });
    }
    // Fetch data for a single department with retry mechanism
    fetchDepartmentData(department, retryCount, delay) {
        return __awaiter(this, void 0, void 0, function* () {
            let attempts = 0;
            while (attempts < retryCount) {
                try {
                    console.log(`Fetching data for department ${department}...`);
                    const data = yield new getDataService_1.GetDataService().getData(department);
                    console.log(`Data fetched for department ${department}`);
                    // Process and save data here if needed
                    const coords = [];
                    yield Promise.all(data).then((datas) => {
                        datas.forEach((data) => {
                            const etablissements = data.data.etablissements;
                            etablissements.forEach((etablissement) => {
                                const x = etablissement.adresseEtablissement.coordonneeLambertAbscisseEtablissement;
                                const y = etablissement.adresseEtablissement.coordonneeLambertOrdonneeEtablissement;
                                const trancheEffectifsUniteLegale = etablissement.uniteLegale.trancheEffectifsUniteLegale;
                                if (x !== null && y !== null && x !== '[ND]' && y !== '[ND]') {
                                    coords.push({
                                        'lat': x,
                                        'lon': y,
                                        'taille': trancheEffectifsUniteLegale,
                                    });
                                }
                            });
                        });
                    });
                    coords.filter((val) => val !== null);
                    const mappedValues = coords.map((value) => {
                        const x = parseFloat(value['lat']);
                        const y = parseFloat(value['lon']);
                        const projetes = (0, proj4_1.default)('EPSG:9794', 'EPSG:4326', [x, y]);
                        // ici il faut convertir la taille avec le bon dictionnaire avant de
                        // le return
                        const tailleKey = value["taille"];
                        return {
                            'lat': projetes[1],
                            'lng': projetes[0],
                            'taille': tailleDict[tailleKey],
                        };
                    });
                    // c'est ici qu'il faut save les mappedValues
                    // console.log("mapped values : ", mappedValues);
                    const mappedValuesString = JSON.stringify(mappedValues);
                    // console.log("mappedValuesString : ", mappedValuesString);
                    fs.writeFile(path_1.default.join(__dirname, `/data/departements/${department}.json`), mappedValuesString, (err) => console.error(err));
                    return data; // You can save the data here if needed
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error(`Error fetching data for department ${department}: ${error.message}`);
                    }
                    else {
                        console.error(`Unknown error occurred for department ${department}:`, error);
                    }
                    attempts++;
                    if (attempts < retryCount) {
                        console.log(`Retrying in ${delay}ms...`);
                        yield new Promise(resolve => setTimeout(resolve, delay)); // Delay before retrying
                    }
                    else {
                        console.log(`Failed to fetch data for department ${department} after ${attempts} attempts.`);
                    }
                }
            }
        });
    }
}
exports.GetAllDataService = GetAllDataService;
