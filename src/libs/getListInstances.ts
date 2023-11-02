import Oci from '../oci';
import { common } from 'oci-sdk';
import { config } from 'dotenv';
config();

export const getListInstances = async (region: string): Promise<string[]> => {
  const instances = [];
  const getRegion =
    region === 'tokyo'
      ? common.Region.AP_TOKYO_1
      : common.Region.AP_SINGAPORE_1;
  const oci = new Oci(getRegion);

  for await (const instance of oci.getComputeClient().listAllInstances({
    compartmentId: process.env.COMPARTMENTID as string,
  })) {
    instances.push(instance.id);
  }

  return instances;
};
