import request from 'supertest';
import { app } from './main';
import { getListInstances } from './libs/getListInstances';

it('works', async () => {
  const response = await request(app.callback()).get('/');
  expect(response.status).toBe(200);
  expect(response.text).toBe(`Healthy ${new Date().toDateString()}`);
});

// it('Should not contains not exists SG instance id', async () => {
//   const response = await request(app.callback()).get('/sg');
//   const instances = await getListInstances('sg');

//   JSON.parse(response.text).map((instance: string) =>
//     expect(instances).toContain(instance)
//   );
// });

it('Should not contains not exists Tokyo instance id', async () => {
  const response = await request(app.callback()).get('/tokyo');
  const instances = await getListInstances('tokyo');

  JSON.parse(response.text).map((instance: string) =>
    expect(instances).toContain(instance)
  );
});
