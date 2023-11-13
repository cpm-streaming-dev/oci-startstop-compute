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
exports.sendNotify = void 0;
const querystring_1 = __importDefault(require("querystring"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const sendNotify = (content) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://notify-api.line.me/api/notify";
    const jsonData = {
        message: ``,
    };
    for (const item of content) {
        jsonData.message += `\n\nDisplay Name: ${item.displayName}\nInstance Id: ${item.instanceId}\nState: ${item.lifecycleState}\nRegion: ${item.region}`;
    }
    const data = yield fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring_1.default.stringify(jsonData)
    });
    const x = yield data.json();
    console.log(x);
});
exports.sendNotify = sendNotify;
