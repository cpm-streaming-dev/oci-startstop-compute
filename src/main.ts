import Koa from 'koa';
import Router from 'koa-router';
import { config } from 'dotenv';
import Oci from './oci';
import { common, core } from 'oci-sdk';
import { readFileSync } from 'fs';
import { getListInstances } from './libs/getListInstances';

config();

const port = process.env.PORT || 3000;

export const app = new Koa();
const router: Router = new Router();

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = `Healthy ${new Date().toDateString()}`;
});

router.get('/cron', async (ctx: Koa.Context) => {
  const authHeader = ctx.request.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return ctx.throw(401, 'Unauthorized');
  }
  const res = await fetch(
    'https://raw.githubusercontent.com/cpm-streaming-dev/oci-startstop-compute/master/README.md'
  );

  const text = await res.text();
  const sgInstances = text
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.split('- ')[1]);

  const sgOCI = new Oci(common.Region.AP_SINGAPORE_1);

  for (const instance of sgInstances) {
    const instanceState = await sgOCI.getComputeClient().getInstance({
      instanceId: instance,
    });

    instanceState?.instance.lifecycleState ===
    core.models.Instance.LifecycleState.Stopped
      ? await sgOCI.getComputeClient().instanceAction({
          instanceId: instance,
          action: core.requests.InstanceActionRequest.Action.Start,
        })
      : await sgOCI.getComputeClient().instanceAction({
          instanceId: instance,
          action: core.requests.InstanceActionRequest.Action.Softstop,
        });
  }

  ctx.body = `Process Done. ${new Date().toString()}`;
});

router.get('/status', async (ctx: Koa.Context) => {
  if (ctx.get('x-api-key') !== process.env.API_KEY) {
    ctx.throw(401, 'Unauthorized');
  }
  const instances = [];
  const region =
    ctx.query.region === 'tokyo'
      ? common.Region.AP_TOKYO_1
      : common.Region.AP_SINGAPORE_1;
  const oci = new Oci(region);

  for await (const instance of oci
    .getComputeClient()
    .listAllInstances({ compartmentId: process.env.COMPARTMENTID as string })) {
    instances.push({
      displayName: instance.displayName,
      instanceId: instance.id,
      lifecycleState: instance.lifecycleState,
    });
  }

  ctx.body = {
    instances: instances,
  };
});

router.get('/task', async (ctx: Koa.Context) => {
  const { region, instanceId, action } = ctx.query;
  const mapRegion =
    region === 'tokyo'
      ? common.Region.AP_TOKYO_1
      : common.Region.AP_SINGAPORE_1;
  const mapAction =
    action === 'start'
      ? core.requests.InstanceActionRequest.Action.Start
      : core.requests.InstanceActionRequest.Action.Softstop;
  const instances = await getListInstances(region as string);
  const oci = new Oci(mapRegion);
  !instances.includes(instanceId as string)
    ? ctx.throw(400, 'Instance Not Found Please check the instance id')
    : await oci.getComputeClient().instanceAction({
        instanceId: instanceId as string,
        action: mapAction,
      });

  ctx.body = 'Process Done';
});

router.get('/test', async (ctx: Koa.Context) => {
  const text = readFileSync('./README.md', 'utf8');
  const sgInstances = text
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.split('- ')[1]);

  const instances = sgInstances.map((line) => line.replace('\r', ''));

  ctx.body = instances;
});

app.use(router.routes());

export const server = app.listen(port);
console.log(`Application is running on port ${port}`);
