import faker from 'faker';
import fs from 'fs';
import { spawn } from 'child_process';
import hash from 'object-hash';
import { Event } from 'push-receiver';
import { ApnsService } from './ApnsService';
import { Apns } from './types';
import { without } from 'ramda';
import { oss } from '../../utils/os.test';

const targetBundle = 'com.test.test';
const targetDevice = faker.datatype.uuid();
const dir = '/tmp';

const event: Event = {
  notification: {
    notification: {
      body: faker.random.word(),
      title: faker.random.word(),
    },
    data: {},
  },
};

jest.mock('child_process');

const setPlatform = (os: NodeJS.Platform) => {
  Object.defineProperty(process, 'platform', { value: os });
};

describe('#persistApns()', () => {
  test('it generates a filename and writes the data to disk', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');

    const service = new ApnsService({ targetBundle, targetDevice, dir });

    const apns: Apns = {
      aps: {
        alert: {
          body: faker.random.word(),
          title: faker.random.word(),
        },
      },
      'Simulator Target Bundle': targetBundle,
    };
    const expectedFilename = `${dir}/${hash(apns)}.apns`;

    const fileName = service.persistApns(apns);

    expect(spy).toHaveBeenCalledWith(expectedFilename, JSON.stringify(apns));
    expect(fileName).toEqual(expectedFilename);
  });

  test('it returns an empty string when there is a write error', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      throw new Error();
    });

    const service = new ApnsService({ targetBundle, targetDevice, dir });

    const apns: Apns = {
      aps: {
        alert: {
          body: faker.random.word(),
          title: faker.random.word(),
        },
      },
      'Simulator Target Bundle': targetBundle,
    };

    const fileName = service.persistApns(apns);

    expect(fileName).toEqual('');
  });
});

describe('#createApnsFromEvent()', () => {
  test('creates an APNS object based on the event passed in', () => {
    const service = new ApnsService({ targetBundle, targetDevice, dir });
    const result = service.createApnsFromEvent(event);

    expect(result).toEqual({
      'Simulator Target Bundle': targetBundle,
      aps: {
        alert: {
          body: event.notification.notification.body,
          title: event.notification.notification.title,
        },
        data: event.notification.data,
      },
    });
  });
});

// This covers lines 50-57
describe('#triggerApnsFromEvent()', () => {
  test('creates and executes an APNS', () => {
    setPlatform('darwin');

    const service = new ApnsService({ targetBundle, targetDevice, dir });

    const fileHash = hash({
      'Simulator Target Bundle': targetBundle,
      aps: {
        alert: {
          body: event.notification.notification.body,
          title: event.notification.notification.title,
        },
        data: event.notification.data,
      },
    });

    service.triggerApnsFromEvent(event);

    expect(spawn).toHaveBeenCalledWith('xcrun', [
      'simctl',
      'push',
      targetDevice,
      targetBundle,
      `${dir}/${fileHash}.apns`,
    ]);
  });
  describe('throws warning on non macOS', () => {
    const table = without<NodeJS.Platform>(['darwin'], oss);

    test.each(table)('when os is %p', (os) => {
      setPlatform(os);
      const logger = {
        warn: jest.fn(),
        info: jest.fn(),
      };

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const service = new ApnsService({ targetBundle, targetDevice, dir }, logger as any);

      service.triggerApnsFromEvent(event);

      expect(logger.warn).toHaveBeenCalledWith('APNS can only be executed on a mac');
    });
  });
});
