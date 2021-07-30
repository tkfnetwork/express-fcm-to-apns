import proxy from 'express-http-proxy';
import { assocPath, path } from 'ramda';
import { ApnsService, FcmService } from './services';
import { Options } from './types';

/**
 * Creates a proxy middleware that will intercept
 * calls to the `interceptPath` end point and inject a
 * new FCM token that can be listened to in the middleware
 */
export const fcmToApns = ({
  apiUrl,
  apns,
  interceptPath,
  logger = console,
  proxyOpts,
  senderId,
  tokenPath,
}: Options) => {
  const fcmService = new FcmService(senderId, logger);
  const apnsService = new ApnsService(apns, logger);

  return proxy(apiUrl, {
    ...proxyOpts,
    proxyReqBodyDecorator: async (body, req) => {
      const bodyObj = JSON.parse(body.toString());
      logger.info(`[Proxy]: Receieved API call for path ${req.path}`);

      // Do nothing if the path does not match
      if (req.path !== interceptPath) {
        logger.info(`[Proxy]: No match. Skipping...`);
        return body;
      }

      logger.info(`[Proxy]: Path matches interceptPath`);

      // Get the current token that was posted from the app
      const appToken = path(tokenPath, bodyObj) as string | undefined;
      if (!appToken) {
        logger.warn(`[Proxy]: Couldn't find the app token in the body at path "${tokenPath.join('.')}". Skipping...`);
        return body;
      }

      // Build a subscriber for this app token
      const subscriber = await fcmService.getSubscriber(appToken);

      // Start listening for messages and trigger APNS
      // events to the simulator
      subscriber.subscribe(apnsService.triggerApnsFromEvent);

      const fcmToken = fcmService.getToken();

      logger.info(`[Proxy]: Started listening and pushing APNS for app token ${appToken}`);
      logger.info(`[Proxy]: Injecting FCM token ${fcmToken} into the body`);

      // Inject the new token into the body
      return assocPath(tokenPath, fcmToken, bodyObj);
    },
  });
};
