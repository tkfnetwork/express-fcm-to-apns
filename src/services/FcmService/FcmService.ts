import { Client, Credentials, Event, listen, register } from 'push-receiver';
import { Subject } from 'rxjs';
import { LoggerType, ServiceLogger } from '../ServiceLogger';

/**
 * FCM Service
 *
 * This service creates the connection to GCM and FCM
 * via `push-receiver` and push new messages to an
 * observable that can be subscribe for
 */
export class FcmService extends ServiceLogger {
  private appToken: string | undefined;
  private credentials: Credentials | undefined;
  private listener: Client | undefined;
  private message$ = new Subject<Event>();
  private persistentIds: Array<string> = [];
  private senderId: string | number;

  constructor(senderId: string | number, logger?: LoggerType) {
    super(logger);

    this.senderId = senderId;
    this.subscribePersistentIds();
  }

  /**
   * Subscribes and listens for messages
   * pushing the ids into a list of ids to pass
   * to `listen`
   */
  private subscribePersistentIds = () => {
    this.message$.subscribe(({ persistentId }) => {
      if (persistentId && !this.persistentIds.includes(persistentId)) {
        this.persistentIds.push(persistentId);
      }
    });
  };

  /**
   * Registers to the GCM and FCM and
   * returns a new set of credentials to use
   * for subscribing to messages
   *
   * @param {string} appToken
   */
  private register = async (appToken: string) => {
    this.logger?.info(`[FCM]: Recieved app token`);
    this.logger?.info(`[FCM][App Token]: ${appToken}`);

    if (this.appToken === appToken && this.credentials) {
      this.logger?.info(`[FCM]: Credentials already exist`);
      this.logger?.info(`[FCM][FCM Token]: ${this.credentials.fcm.token}`);

      return this.credentials;
    }

    this.appToken = appToken;
    this.credentials = await register(this.senderId.toString());

    this.logger?.info(`[FCM]: Registered new FCM token`);
    this.logger?.info(`[FCM][FCM Token]: ${this.getToken()}`);

    return this.credentials;
  };

  /**
   * Get a subscriber for the current app token
   *
   * @param appToken
   */
  getSubscriber = async (appToken: string) => {
    const credentials = this.credentials || (await this.register(appToken));

    // Cleanup any listener that was existing before
    this.listener?.destroy?.();

    // Start the new listener
    this.listener = await listen(
      // Pass in config with set credentials
      {
        ...credentials,
        persistentIds: this.persistentIds,
      },

      // Push incoming messages to the observable
      (event) => this.message$.next(event)
    );

    this.logger?.info(`[FCM]: Started listening for FCM messages...`);
    this.logger?.info(`[FCM][App Token]: ${appToken}`);
    this.logger?.info(`[FCM][FCM Token]: ${credentials.fcm.token}`);

    return this.message$;
  };

  /**
   * Get the current FCM token if it exists
   */
  getToken = () => this.credentials?.fcm?.token;
}
