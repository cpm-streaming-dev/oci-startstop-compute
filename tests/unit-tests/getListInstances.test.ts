import { getListInstances } from '../../src/lib/getListInstances';

it('List SG instances', async () => {
  const instances = await getListInstances('sg');
  expect(instances).toEqual(expect.any(Array));
});

it('List Tokyo instances', async () => {
  const instances = await getListInstances('tokyo');
  expect(instances).toEqual(expect.any(Array));
});
