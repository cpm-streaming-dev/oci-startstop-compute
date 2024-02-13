import { common, core } from 'oci-sdk';
import { config } from 'dotenv';
config();

class Oci {
  private computeClient: core.ComputeClient;
  private networkClient: core.VirtualNetworkClient;
  private tenancy = process.env.TENANCY ?? '';
  private user = process.env.USERID ?? '';
  private fingerprint = process.env.FINGERPRINT ?? '';
  private passphrase = process.env.PASSPHRASE ?? null; // optional parameter
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
    this.networkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider,
    });
  }

  public getComputeClient() {
    return this.computeClient;
  }

  public getNetworkClient() {
    return this.networkClient;
  }
}

export default Oci;
