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
// Import the 'express' module
const express_1 = __importDefault(require("express"));
const getDataService_1 = require("./getDataService");
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
const proj4_1 = __importDefault(require("proj4"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
// load env variables
dotenv_1.default.config({ path: path.resolve(__dirname, "../.env") });
// define projection lambert
proj4_1.default.defs('EPSG:9794', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs +type=crs');
// Create an Express application
const app = (0, express_1.default)();
// Use CORS middleware
app.use((0, cors_1.default)());
// Set the port number for the server
const port = 3000;
// create service to get data
const dataService = new getDataService_1.GetDataService;
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
// Define a route for the root path ('/')
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Send a response to the client
    // const departement = parseInt(departementString);
    const departement = req.query.departement;
    const pathDepartement = path.resolve(__dirname, `data/departements/${departement}.json`);
    const departementLocalExists = fs.existsSync(pathDepartement);
    if (departementLocalExists) {
        // load departements local
        const mappedValues = JSON.parse(fs.readFileSync(pathDepartement, 'utf-8'));
        // console.log("mappedvalues loaded : ", mappedValues);
        res.json(mappedValues);
    }
    else {
        if (departement) {
            const data = yield dataService.getData(departement);
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
            fs.writeFile(path.join(__dirname, `/data/departements/${departement}.json`), mappedValuesString, (err) => console.error(err));
            res.json(mappedValues);
        }
    }
}));
// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});
