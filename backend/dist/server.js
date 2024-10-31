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
// Import the 'express' module
const express_1 = __importDefault(require("express"));
const getDataService_1 = require("./getDataService");
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
    //   res.send('Hello, TypeScript + Node.js + Express!');
    res.json(data);
}));
// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});
