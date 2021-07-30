import { Logger } from 'winston';

export type LoggerType = typeof console | Logger;

export class ServiceLogger {
  logger: LoggerType | undefined;

  constructor(logger?: LoggerType) {
    if (logger) {
      this.attachLogger(logger);
    }
  }

  attachLogger = (logger: LoggerType) => (this.logger = logger);
}
