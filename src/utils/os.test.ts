import { isMac, isOS } from './os';
import process from 'process';
import { without } from 'ramda';

const oss: Array<NodeJS.Platform> = [
  'aix',
  'android',
  'cygwin',
  'darwin',
  'freebsd',
  'haiku',
  'linux',
  'netbsd',
  'openbsd',
  'sunos',
  'win32',
];

const setPlatform = (os: NodeJS.Platform) => {
  Object.defineProperty(process, 'platform', { value: os });
};

test.each(oss)('isOS() when os is %p', (os) => {
  setPlatform(os);
  oss.forEach((otherOs) => {
    if (os === otherOs) {
      expect(isOS(os))[os === otherOs ? 'toBeTruthy' : 'toBefalsy'];
    }
  });
});

test('isMac()', () => {
  setPlatform('darwin');
  expect(isMac()).toBeTruthy();

  without<NodeJS.Platform>(['darwin'], oss).forEach((os) => {
    setPlatform(os);
    expect(isMac()).toBeFalsy();
  });
});
