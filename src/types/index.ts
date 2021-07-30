import { ProxyOptions } from 'express-http-proxy';
import { ApnsServiceOptions } from '../services';
import { LoggerType } from '../services';

export type Options = {
  apns: ApnsServiceOptions;
  proxyOpts?: Omit<ProxyOptions, 'proxyReqBodyDecorator'>;
  apiUrl: string;
  senderId: string | number;

  /**
   * Supply the API route that is used
   * to save your token to your own API
   */
  interceptPath: string;

  /**
   * The token path is used to extract the
   * the token from the body of the intercepted api
   * call and is also used to inject the new token
   */
  tokenPath: Array<string>;

  logger?: LoggerType;
};
