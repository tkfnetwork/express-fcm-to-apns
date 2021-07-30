import { LoggerType } from './types';

/**
 * Service Logger
 *
 * Class that attachs a logger to the chil
 * class when extended
 */
export class ServiceLogger {
  logger: LoggerType | undefined;

  constructor(logger?: LoggerType) {
    if (logger) {
      this.attachLogger(logger);
    }
  }

  /**
   * Attach a logger to this class
   *
   * @param {object} logger
   */
  attachLogger = (logger: LoggerType) => (this.logger = logger);
}
