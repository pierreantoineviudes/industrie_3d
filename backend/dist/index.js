"use strict";
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
const path_1 = __importDefault(require("path"));
const getAllDataService_1 = require("./getAllDataService");
const dotenv_1 = __importDefault(require("dotenv"));
// load env variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const getAllDataService = new getAllDataService_1.GetAllDataService();
        try {
            // Call getAllData to start fetching data for all departments
            yield getAllDataService.getAllData();
            console.log('Successfully processed all departments.');
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error during data fetching: ${error.message}`);
            }
            else {
                console.error(`Unknown error occurred:`, error);
            }
        }
    });
}
// Run the function
run();
