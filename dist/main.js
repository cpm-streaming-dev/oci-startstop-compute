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
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const dotenv_1 = require("dotenv");
const oci_1 = __importDefault(require("./oci"));
const oci_sdk_1 = require("oci-sdk");
const getListInstances_1 = require("./libs/getListInstances");
(0, dotenv_1.config)();
const port = process.env.PORT || 3000;
const app = new koa_1.default();
const router = new koa_router_1.default();
router.get('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = `Healthy ${new Date().toString()}`;
}));
router.get('/cron', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch('https://raw.githubusercontent.com/cpm-streaming-dev/oci-startstop-compute/master/README.md');
    const text = yield res.text();
    const sgInstances = text
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.split('- ')[1]);
    const sgOCI = new oci_1.default(oci_sdk_1.common.Region.AP_SINGAPORE_1);
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
                action: oci_sdk_1.core.requests.InstanceActionRequest.Action.Stop,
            });
    }
    ctx.body = `Process Done. ${new Date().toString()}`;
}));
router.get('/status', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const instances = [];
    const region = ctx.query.region === 'tokyo'
        ? oci_sdk_1.common.Region.AP_TOKYO_1
        : oci_sdk_1.common.Region.AP_SINGAPORE_1;
    const oci = new oci_1.default(region);
    try {
        for (var _d = true, _e = __asyncValues(oci
            .getComputeClient()
            .listAllInstances({ compartmentId: process.env.COMPARTMENTID })), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const instance = _c;
            instances.push({
                displayName: instance.displayName,
                instanceId: instance.id,
                lifecycleState: instance.lifecycleState,
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    ctx.body = {
        instances: instances,
    };
}));
router.get('/test', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch('https://raw.githubusercontent.com/cpm-streaming-dev/oci-startstop-compute/master/README.md');
    const text = yield res.text();
    const sgInstances = text
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.split('- ')[1]);
    const instances2 = yield (0, getListInstances_1.getListInstances)("sg");
    const intersection = sgInstances.filter(element => !instances2.includes(element));
    console.log(intersection);
    ctx.body = "test";
}));
app.use(router.routes());
app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
});
