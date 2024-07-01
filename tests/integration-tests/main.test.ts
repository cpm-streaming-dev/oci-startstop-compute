import request from 'supertest';
import { server } from '../../src/main';
import { getListInstances } from '../../src/lib/getListInstances';
import { Instance } from '../../src/types/Instances';

it('works', async () => {
  const response = await request(server).get('/');
  expect(response.status).toBe(200);
  expect(response.text).toBe(`Healthy ${new Date().toDateString()}`);
});

describe('Cron', () => {
  it('Cron should return unauthorize', async () => {
    await request(server)
      .get('/cron')
      .set({ 'x-api-key': 'invalid key' })
      .expect(401);
  });
});

describe('Get Instance IP', () => {
  it('Get instance ip should return unauthorize', async () => {
    await request(server)
      .get('/ip')
      .set({ 'x-api-key': 'invalid key' })
      .expect(401);
  });
  it('Should return public Ip', async () => {
    const response = await request(server)
      .get(
        '/ip?instanceId=ocid1.instance.oc1.ap-singapore-1.anzwsljrk644ttqc7jub553aepgufjdx6kbuf2sl3jixbabt6yscdxw4z7nq&region=sg'
      )
      .set({ 'x-api-key': process.env.API_KEY as string });
    const expectedIp = { publicIP: '138.2.78.77' };

    expect(JSON.parse(response.text)).toEqual(expectedIp);
  });
});

describe('Get List Instances status', () => {
  it('List all instances should return unauthorize', async () => {
    await request(server)
      .get('/status')
      .set({ 'x-api-key': 'invalid key' })
      .expect(401);
  });
  it('List all instances should', async () => {
    const response = await request(server)
      .get('/status')
      .query({ region: 'sg' })
      .set({ 'x-api-key': process.env.API_KEY as string });
    const instances = await getListInstances('sg');
    JSON.parse(response.text).instances.map((instance: Instance) =>
      expect(instances).toContain(instance.instanceId)
    );
  });
});

describe('Get List Instances', () => {
  describe('List Tokyo Instances', () => {
    it('List all tokyo instances', async () => {
      const response = await request(server).get('/tokyo');
      const instances = await getListInstances('tokyo');
      JSON.parse(response.text).map((instance: string) =>
        expect(instances).toContain(instance)
      );
    });
    it('List all singapore instances', async () => {
      const response = await request(server).get('/sg');
      const instances = await getListInstances('sg');

      JSON.parse(response.text).map((instance: string) =>
        expect(instances).toContain(instance)
      );
    });
  });
});

describe('Task', () => {
  it('Should return unauthorize', async () => {
    await request(server)
      .get('/task')
      .query({
        region: 'tokyo',
        instanceId:
          'ocid1.instance.oc1.ap-tokyo-1.anxhiljrk644ttqclh6le6oiai7dceh2pjzl6dplvmgnxu3o5m3nznhiu7eq',
        action: 'stop',
      })
      .set({ 'x-api-key': 'invalid key' })
      .expect(401);
  });
});

afterAll(() => {
  server.close();
});
