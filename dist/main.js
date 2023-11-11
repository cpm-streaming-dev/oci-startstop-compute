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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const dotenv_1 = require("dotenv");
const oci_1 = __importDefault(require("./oci"));
const oci_sdk_1 = require("oci-sdk");
const fs_1 = require("fs");
const getListInstances_1 = require("./libs/getListInstances");
const sendMail_1 = require("./libs/sendMail");
(0, dotenv_1.config)();
const port = process.env.PORT || 3000;
exports.app = new koa_1.default();
const router = new koa_router_1.default();
router.get('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = `Healthy ${new Date().toDateString()}`;
}));
router.get('/cron', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = ctx.request.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return ctx.throw(401, 'Unauthorized');
    }
    const res = yield fetch('https://raw.githubusercontent.com/cpm-streaming-dev/oci-startstop-compute/master/README.md');
    const mailContent = [];
    const text = yield res.text();
    const sgInstances = text
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.split('- ')[1]);
    const tokyoInstances = text
        .split('\n')
        .filter((line) => line.startsWith('+ '))
        .map((line) => line.split('+ ')[1]);
    const sgOCI = new oci_1.default(oci_sdk_1.common.Region.AP_SINGAPORE_1);
    const tokyoOCI = new oci_1.default(oci_sdk_1.common.Region.AP_TOKYO_1);
    for (const instance of sgInstances) {
        const instanceState = yield sgOCI.getComputeClient().getInstance({
            instanceId: instance,
        });
        mailContent.push({
            displayName: instanceState.instance.displayName,
            instanceId: instanceState.instance.id,
            lifecycleState: instanceState.instance.lifecycleState === oci_sdk_1.core.models.Instance.LifecycleState.Stopped
                ? 'Stopped'
                : 'Running',
            region: instanceState.instance.region,
        });
        (instanceState === null || instanceState === void 0 ? void 0 : instanceState.instance.lifecycleState) ===
            oci_sdk_1.core.models.Instance.LifecycleState.Stopped
            ? yield sgOCI.getComputeClient().instanceAction({
                instanceId: instance,
                action: oci_sdk_1.core.requests.InstanceActionRequest.Action.Start,
            })
            : yield sgOCI.getComputeClient().instanceAction({
                instanceId: instance,
                action: oci_sdk_1.core.requests.InstanceActionRequest.Action.Softstop,
            });
    }
    for (const instance of tokyoInstances) {
        const instanceState = yield tokyoOCI.getComputeClient().getInstance({
            instanceId: instance,
        });
        (instanceState === null || instanceState === void 0 ? void 0 : instanceState.instance.lifecycleState) ===
            oci_sdk_1.core.models.Instance.LifecycleState.Stopped
            ? yield tokyoOCI.getComputeClient().instanceAction({
                instanceId: instance,
                action: oci_sdk_1.core.requests.InstanceActionRequest.Action.Start,
            })
            : yield tokyoOCI.getComputeClient().instanceAction({
                instanceId: instance,
                action: oci_sdk_1.core.requests.InstanceActionRequest.Action.Softstop,
            });
        mailContent.push({
            displayName: instanceState.instance.displayName,
            instanceId: instanceState.instance.id,
            lifecycleState: instanceState.instance.lifecycleState === oci_sdk_1.core.models.Instance.LifecycleState.Stopped
                ? 'Stopped'
                : 'Running',
            region: instanceState.instance.region,
        });
    }
    yield (0, sendMail_1.sendMail)(mailContent);
    ctx.body = `Process Done. ${new Date().toString()}`;
}));
router.get('/status', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d;
    if (ctx.get('x-api-key') !== process.env.API_KEY) {
        ctx.throw(401, 'Unauthorized');
    }
    const instances = [];
    const region = ctx.query.region === 'tokyo'
        ? oci_sdk_1.common.Region.AP_TOKYO_1
        : oci_sdk_1.common.Region.AP_SINGAPORE_1;
    const oci = new oci_1.default(region);
    try {
        for (var _e = true, _f = __asyncValues(oci
            .getComputeClient()
            .listAllInstances({ compartmentId: process.env.COMPARTMENTID })), _g; _g = yield _f.next(), _a = _g.done, !_a; _e = true) {
            _c = _g.value;
            _e = false;
            const instance = _c;
            instances.push({
                displayName: instance.displayName,
                instanceId: instance.id,
                lifecycleState: instance.lifecycleState,
                region: (_d = ctx.query.region) !== null && _d !== void 0 ? _d : 'sg',
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_e && !_a && (_b = _f.return)) yield _b.call(_f);
        }
        finally { if (e_1) throw e_1.error; }
    }
    ctx.body = {
        instances: instances,
    };
}));
router.get('/task', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.get('x-api-key') !== process.env.API_KEY) {
        ctx.throw(401, 'Unauthorized');
    }
    const { region, instanceId, action } = ctx.query;
    const mapRegion = region === 'tokyo'
        ? oci_sdk_1.common.Region.AP_TOKYO_1
        : oci_sdk_1.common.Region.AP_SINGAPORE_1;
    const mapAction = action === 'start'
        ? oci_sdk_1.core.requests.InstanceActionRequest.Action.Start
        : oci_sdk_1.core.requests.InstanceActionRequest.Action.Softstop;
    const instances = yield (0, getListInstances_1.getListInstances)(region);
    const oci = new oci_1.default(mapRegion);
    !instances.includes(instanceId)
        ? ctx.throw(400, 'Instance Not Found Please check the instance id')
        : yield oci.getComputeClient().instanceAction({
            instanceId: instanceId,
            action: mapAction,
        });
    ctx.body = 'Process Done';
}));
router.get('/sg', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const text = (0, fs_1.readFileSync)('./README.md', 'utf8');
    const sgInstances = text
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.split('- ')[1]);
    const instances = sgInstances.map((line) => line.replace('\r', ''));
    ctx.body = instances;
}));
router.get('/tokyo', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const text = (0, fs_1.readFileSync)('./README.md', 'utf8');
    const tokyoInstances = text
        .split('\n')
        .filter((line) => line.startsWith('+ '))
        .map((line) => line.split('+ ')[1]);
    const instances = tokyoInstances.map((line) => line.replace('\r', ''));
    ctx.body = instances;
}));
router.get('/test', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, sendMail_1.sendMail)([{
            displayName: "haa",
            instanceId: "haa",
            lifecycleState: "aa",
            region: 'sg'
        },
        {
            displayName: "haa1",
            instanceId: "haa1",
            lifecycleState: "aa1",
            region: 'sg'
        }]);
    ctx.body = "done";
}));
exports.app.use(router.routes());
exports.server = exports.app.listen(port, () => console.log(`Application is running on port ${port}`));
