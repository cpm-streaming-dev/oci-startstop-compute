import { common, core } from 'oci-sdk';
import { WorkRequestClient } from 'oci-workrequests';
import { config } from 'dotenv';
config();

class Oci {
  private computeClient: core.ComputeClient;
  private workRequestClient: WorkRequestClient;
  private waiterConfiguration: common.WaiterConfiguration;
  private networkClient: core.VirtualNetworkClient;
  private maxTimeInSeconds = 60 * 60; // The duration for waiter configuration before failing. Currently set to 1 hour.
  private maxDelayInSeconds = 30; // The max delay for the waiter configuration. Currently set to 30 seconds
  private tenancy = process.env.TENANCY || '';
  private user = process.env.USERID || '';
  private fingerprint = process.env.FINGERPRINT || '';
  private passphrase = process.env.PASSPHRASE || null; // optional parameter
  private privateKey = Buffer.from(
    process.env.SECRET_KEY as string,
    'base64'
  ).toString('utf8');
  constructor(region?: common.Region) {
    const provider = new common.SimpleAuthenticationDetailsProvider(
      this.tenancy,
      this.user,
      this.fingerprint,
      this.privateKey,
      this.passphrase,
      region
    );
    this.computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider,
    });
    this.workRequestClient = new WorkRequestClient({
      authenticationDetailsProvider: provider,
    });
    this.waiterConfiguration = {
      terminationStrategy: new common.MaxTimeTerminationStrategy(
        this.maxTimeInSeconds
      ),
      delayStrategy: new common.ExponentialBackoffDelayStrategy(
        this.maxDelayInSeconds
      ),
    };
    this.networkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider,
    });
  }

  public getComputeClient() {
    return this.computeClient;
  }

  public getWorkerRequestClient() {
    return this.workRequestClient;
  }

  public getWaiterConfiguration() {
    return this.waiterConfiguration;
  }

  public getNetworkClient() {
    return this.networkClient;
  }
}

export default Oci;
