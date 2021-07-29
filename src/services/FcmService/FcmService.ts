import { Client, Credentials, Event, listen, register } from 'push-receiver';
import { Subject } from 'rxjs';

/**
 * FCM Service
 *
 * This service creates the connection to GCM and FCM
 * via `push-receiver` and push new messages to an
 * observable that can be subscribe for
 */
export class FcmService {
  private appToken: string | undefined;
  private credentials: Credentials | undefined;
  private listener: Client | undefined;
  private message$ = new Subject<Event>();
  private persistentIds: Array<string> = [];
  private senderId: string | number;

  constructor(senderId: string | number) {
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
    if (this.appToken === appToken && this.credentials) return this.credentials;

    const result = await register(this.senderId.toString());
    this.appToken = appToken;

    return result;
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
      this.message$.next
    );

    return this.message$.subscribe;
  };

  /**
   * Get the current FCM token if it exists
   */
  getToken = () => this.credentials?.fcm?.token;
}
