"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oci_sdk_1 = require("oci-sdk");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class Oci {
    constructor(region) {
        var _a, _b, _c, _d;
        this.tenancy = (_a = process.env.TENANCY) !== null && _a !== void 0 ? _a : '';
        this.user = (_b = process.env.USERID) !== null && _b !== void 0 ? _b : '';
        this.fingerprint = (_c = process.env.FINGERPRINT) !== null && _c !== void 0 ? _c : '';
        this.passphrase = (_d = process.env.PASSPHRASE) !== null && _d !== void 0 ? _d : null; // optional parameter
        this.privateKey = Buffer.from(process.env.SECRET_KEY, 'base64').toString('utf8');
        const provider = new oci_sdk_1.common.SimpleAuthenticationDetailsProvider(this.tenancy, this.user, this.fingerprint, this.privateKey, this.passphrase, region);
        this.computeClient = new oci_sdk_1.core.ComputeClient({
            authenticationDetailsProvider: provider,
        });
        this.networkClient = new oci_sdk_1.core.VirtualNetworkClient({
            authenticationDetailsProvider: provider,
        });
    }
    getComputeClient() {
        return this.computeClient;
    }
    getNetworkClient() {
        return this.networkClient;
    }
}
exports.default = Oci;
