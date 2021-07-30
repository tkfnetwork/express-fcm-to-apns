import { isNotEmpty } from './logic';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const table: Array<[any, boolean]> = [
  [[], false],
  [{}, false],
  ['', false],
  [[null], true],
  [[''], true],
  [{ foo: 'bar' }, true],
  ['bar', true],
];

test.each(table)('isNotEmpty() when given %p returns %p', (value, truthy) => {
  expect(isNotEmpty(value))[truthy ? 'toBeTruthy' : 'toBeFalsy']();
});
