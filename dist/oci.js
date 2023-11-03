"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oci_sdk_1 = require("oci-sdk");
const oci_workrequests_1 = require("oci-workrequests");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class Oci {
    constructor(region) {
        this.maxTimeInSeconds = 60 * 60; // The duration for waiter configuration before failing. Currently set to 1 hour.
        this.maxDelayInSeconds = 30; // The max delay for the waiter configuration. Currently set to 30 seconds
        this.tenancy = process.env.TENANCY || '';
        this.user = process.env.USERID || '';
        this.fingerprint = process.env.FINGERPRINT || '';
        this.passphrase = process.env.PASSPHRASE || null; // optional parameter
        this.privateKey = Buffer.from(process.env.SECRET_KEY, 'base64').toString('utf8');
        const provider = new oci_sdk_1.common.SimpleAuthenticationDetailsProvider(this.tenancy, this.user, this.fingerprint, this.privateKey, this.passphrase, region);
        this.computeClient = new oci_sdk_1.core.ComputeClient({
            authenticationDetailsProvider: provider,
        });
        this.workRequestClient = new oci_workrequests_1.WorkRequestClient({
            authenticationDetailsProvider: provider,
        });
        this.waiterConfiguration = {
            terminationStrategy: new oci_sdk_1.common.MaxTimeTerminationStrategy(this.maxTimeInSeconds),
            delayStrategy: new oci_sdk_1.common.ExponentialBackoffDelayStrategy(this.maxDelayInSeconds),
        };
    }
    getComputeClient() {
        return this.computeClient;
    }
    getWorkerRequestClient() {
        return this.workRequestClient;
    }
    getWaiterConfiguration() {
        return this.waiterConfiguration;
    }
}
exports.default = Oci;
