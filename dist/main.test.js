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
const supertest_1 = __importDefault(require("supertest"));
const main_1 = require("./main");
const getListInstances_1 = require("./libs/getListInstances");
it('works', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(main_1.app.callback()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe(`Healthy ${new Date().toString()}`);
}));
it('Should not contains not exists SG instance', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(main_1.app.callback()).get('/test');
    const instances = yield (0, getListInstances_1.getListInstances)("sg");
    JSON.parse(response.text).map((instance) => expect(instances).toContain(instance));
}));
afterAll(() => {
    main_1.server.close();
});
