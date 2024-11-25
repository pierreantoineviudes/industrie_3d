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
Object.defineProperty(exports, "__esModule", { value: true });
const getAllDataService_1 = require("./getAllDataService");
// Initialize GetAllDataService and call getAllData
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Autho : ", process.env.SIRENE_API_KEY);
        const dataService = new getAllDataService_1.GetAllDataService();
        const allData = yield dataService.getAllData();
        console.log(allData);
    });
}
execute();
