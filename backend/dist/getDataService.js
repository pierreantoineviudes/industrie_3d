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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDataService = void 0;
const fs = __importStar(require("fs"));
const csv = require("csv-parser");
const path = __importStar(require("path"));
class GetDataService {
    constructor() {
        // Example: Replace with actual API endpoint
        this.base_url = "https://api.insee.fr/api-sirene/3.11/siret/";
        this.champs = "siret,activitePrincipaleUniteLegale,trancheEffectifsUniteLegale,codeCommuneEtablissement,coordonneeLambertAbscisseEtablissement,coordonneeLambertOrdonneeEtablissement";
        this.departement = "62";
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            // readd csv
            const nafCodes = yield this.readNafCodes();
            nafCodes.forEach((code) => {
                const query = `activitePrincipaleUniteLegale:${code} AND trancheEffectifsUniteLegale:[0 TO 53] AND codeCommuneEtablissement:${this.departement}*`;
                const params = {
                    "q": query,
                    "champs": this.champs,
                    "nombre": "1000"
                };
            });
            return nafCodes;
        });
    }
    readNafCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            // read JSON data
            const csvNafs = [];
            const filePath = path.resolve(__dirname, 'data/interesting_naf_codes.csv');
            console.log(__dirname);
            console.log(`filePath : ${filePath}`);
            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath, 'utf-8')
                    .pipe(csv({ separator: "|" }))
                    .on('data', (data) => csvNafs.push(data))
                    .on('end', () => resolve(csvNafs))
                    .on('error', (error) => {
                    console.log("error reading csvnaf codes");
                    reject(error);
                });
            });
        });
    }
}
exports.GetDataService = GetDataService;
