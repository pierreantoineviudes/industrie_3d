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
// load env variables
dotenv_1.default.config({ path: path.resolve(__dirname, "../.env") });
// define projection lambert
proj4_1.default.defs('EPSG:9794', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs +type=crs');
// Create an Express application
const app = (0, express_1.default)();
// Set the port number for the server
const port = 3000;
// create service to get data
const dataService = new getDataService_1.GetDataService;
// Define a route for the root path ('/')
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Send a response to the client
    const data = yield dataService.getData();
    const coords = [];
    yield Promise.all(data).then((datas) => {
        datas.forEach((data) => {
            const etablissements = data.data.etablissements;
            etablissements.forEach((etablissement) => {
                const x = etablissement.adresseEtablissement.coordonneeLambertAbscisseEtablissement;
                const y = etablissement.adresseEtablissement.coordonneeLambertOrdonneeEtablissement;
                if (x !== null && y !== null && x !== '[ND]' && y !== '[ND]') {
                    coords.push([x, y]);
                }
            });
        });
    });
    coords.filter((val) => val !== null);
    // TODO : convertir les donnees en numérique
    // TODO : convertir les données en WSG 84
    // TODO : dégager les coordonnées NULL
    console.log(coords);
    const mappedValues = coords.map((value) => {
        const x = parseFloat(value[0]);
        const y = parseFloat(value[1]);
        const projetes = (0, proj4_1.default)('EPSG:9794', 'EPSG:4326', [x, y]);
        return {
            'lat': projetes[1],
            'lng': projetes[0],
        };
    });
    res.json(mappedValues);
}));
// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});
