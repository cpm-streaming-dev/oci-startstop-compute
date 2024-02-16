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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const dotenv_1 = require("dotenv");
const oci_1 = __importDefault(require("./oci"));
const oci_sdk_1 = require("oci-sdk");
const fs_1 = require("fs");
const getListInstances_1 = require("./lib/getListInstances");
(0, dotenv_1.config)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
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
    if (sgInstances.length || tokyoInstances.length !== 0) {
        for (const instance of sgInstances) {
            const instanceState = yield sgOCI.getComputeClient().getInstance({
                instanceId: instance,
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
    }
    if (tokyoInstances.length || tokyoInstances.length !== 0) {
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
        }
    }
    ctx.body = {
        message: `Process Done. ${new Date().toString()}`,
    };
}));
router.get('/status', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, e_1, _c, _d;
    var _e;
    if (ctx.get('x-api-key') !== process.env.API_KEY) {
        ctx.throw(401, 'Unauthorized');
    }
    const instances = [];
    const region = ctx.query.region === 'tokyo'
        ? oci_sdk_1.common.Region.AP_TOKYO_1
        : oci_sdk_1.common.Region.AP_SINGAPORE_1;
    const oci = new oci_1.default(region);
    try {
        for (var _f = true, _g = __asyncValues(oci
            .getComputeClient()
            .listAllInstances({ compartmentId: process.env.COMPARTMENTID })), _h; _h = yield _g.next(), _b = _h.done, !_b; _f = true) {
            _d = _h.value;
            _f = false;
            const instance = _d;
            instances.push({
                displayName: instance.displayName,
                instanceId: instance.id,
                lifecycleState: instance.lifecycleState,
                region: (_e = ctx.query.region) !== null && _e !== void 0 ? _e : 'sg',
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_b && (_c = _g.return)) yield _c.call(_g);
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
router.get('/ip', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.get('x-api-key') !== process.env.API_KEY) {
        ctx.throw(401, 'Unauthorized');
    }
    const region = ctx.query.region === 'tokyo'
        ? oci_sdk_1.common.Region.AP_TOKYO_1
        : oci_sdk_1.common.Region.AP_SINGAPORE_1;
    const oci = new oci_1.default(region);
    const attachmentReq = {
        compartmentId: process.env.COMPARTMENTID,
        instanceId: ctx.query.instanceId,
    };
    const vcinResponse = yield oci
        .getComputeClient()
        .listVnicAttachments(attachmentReq);
    const vcnReq = {
        vcnId: vcinResponse.items[0].vnicId,
    };
    const response = yield oci.getNetworkClient().getVnic({
        vnicId: vcnReq.vcnId,
    });
    ctx.body = {
        publicIP: response.vnic.publicIp,
    };
}));
exports.app.use(router.routes());
exports.server = exports.app.listen(port, () => console.log(`Application is running on port ${port}`));
