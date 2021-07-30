import faker from 'faker';
export { Client, Credentials, Event } from 'push-receiver';

export const listen = jest.fn();
export const register = jest.fn(() => ({
  fcm: {
    token: faker.datatype.uuid(),
  },
}));
