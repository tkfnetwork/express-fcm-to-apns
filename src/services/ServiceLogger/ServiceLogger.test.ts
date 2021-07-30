import { ServiceLogger } from './ServiceLogger';

test('initialisation is correct', () => {
  expect(new ServiceLogger().logger).toBeUndefined();
  expect(new ServiceLogger(console).logger).toBe(console);
});

test('#attachLogger works correctly', () => {
  const serviceLogger = new ServiceLogger();

  serviceLogger.attachLogger(console);

  expect(serviceLogger.logger).toBe(console);
});
