import { ProxyOptions } from 'express-http-proxy';
import { ApnsServiceOptions } from '../services';

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
   * posted token and to inject the new token
   * back into the body payload
   */
  tokenPath: Array<string>;
};
