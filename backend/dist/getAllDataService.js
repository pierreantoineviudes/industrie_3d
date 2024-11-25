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
exports.GetAllDataService = void 0;
const getDataService_1 = require("./getDataService");
// TODO: download tous les datas de tous les departements
class GetAllDataService {
    getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataService = new getDataService_1.GetDataService;
            const promises = [];
            for (let i = 0; i < 95; i++) {
                promises.push(dataService.getData(i.toString()));
            }
            return Promise.all(promises);
        });
    }
}
exports.GetAllDataService = GetAllDataService;
