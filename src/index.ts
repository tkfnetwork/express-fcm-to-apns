import proxy from 'express-http-proxy';
import { assocPath, path } from 'ramda';
import { ApnsService, FcmService } from './services';
import { Options } from './types';

/**
 * Creates a proxy middleware that will intercept
 * calls to the `interceptPath` end point and inject a
 * new FCM token that can be listened to in the middleware
 */
export const fcmToApns = async ({ senderId, apns, proxyOpts, apiUrl, interceptPath, tokenPath }: Options) => {
  const fcmService = new FcmService(senderId);
  const apnsService = new ApnsService(apns);

  return proxy(apiUrl, {
    ...proxyOpts,
    proxyReqBodyDecorator: async (body: Record<string, unknown>, req) => {
      // Do nothing if the path does not match
      if (req.path !== interceptPath) return body;

      // Get the current token that was posted from the app
      const appToken = path(tokenPath, body) as string | undefined;
      if (!appToken) return body;

      // Build a subscriber for this app token
      const subscriber = await fcmService.getSubscriber(appToken);

      // Start listening for messages and trigger APNS
      // events to the simulator
      subscriber(apnsService.triggerApnsFromEvent);

      // Inject the new token into the body
      return assocPath(tokenPath, fcmService.getToken(), body);
    },
  });
};
