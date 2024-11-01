import * as fs from 'fs';
import csv = require('csv-parser');
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import { parseArgs } from 'util';

export class GetDataService {

    // Example: Replace with actual API endpoint
    private base_url = "https://api.insee.fr/api-sirene/3.11/siret/";
    private champs = "siret,activitePrincipaleUniteLegale,trancheEffectifsUniteLegale,codeCommuneEtablissement,coordonneeLambertAbscisseEtablissement,coordonneeLambertOrdonneeEtablissement";
    private departement = "75";
    private token = process.env.SIRENE_API_KEY;
    private headers = {
        "X-INSEE-Api-Key-Integration": this.token,
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
    }

    async getData() {
        // read csv    
        const nafCodes: any = await this.readNafCodes();
        const promises: Promise<AxiosResponse<any, any>>[] = [];
        const tailleSlice = 20;
        // boucle sur les slices
        for (let i = 0; i < nafCodes.length; i += tailleSlice) {
            const nafGroupe = nafCodes.slice(i, Math.min(i + tailleSlice, nafCodes.length));
            let query = `trancheEffectifsUniteLegale:[0 TO 53] AND codeCommuneEtablissement:${this.departement}* AND (activitePrincipaleUniteLegale:${nafGroupe[0]["Code NAF"].slice(0, 2) + '.' + nafGroupe[0]["Code NAF"].slice(2)} `;
            nafGroupe.slice(1).forEach((code: any) => {
                query += `OR activitePrincipaleUniteLegale:${code["Code NAF"].slice(0, 2) + '.' + code["Code NAF"].slice(2)} `;
            });
            query += ")";

            const params = {
                "q": query,
                "champs": this.champs,
                "nombre": "1000"
            }

            // fetching webservice with query
            try {
                const promise = axios.get(this.base_url, { headers: this.headers, params: params })
                promises.push(promise);
            } catch (error: any) {
                if (error.isAxiosError && error.response) {
                    console.error(error.response.data);
                }
            }
        }

        return promises;
    }

    async readNafCodes() {
        // read JSON data
        const csvNafs: string[] = [];
        const filePath = path.resolve(__dirname, 'data/interesting_naf_codes.csv');

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath, 'utf-8')
                .pipe(csv({ separator: "|" }))
                .on('data', (data: any) => csvNafs.push(data))
                .on('end', () => resolve(csvNafs))
                .on('error', (error: any) => {
                    console.log("error reading csvnaf codes");
                    reject(error);
                });
        })
    }
}