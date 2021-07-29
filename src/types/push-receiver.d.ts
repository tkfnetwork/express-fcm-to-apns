declare module 'push-receiver' {
  export type Credentials = { fcm: { token: string } };
  export type Notification = {
    title: string;
    subtitle?: string;
    body: string;
  };
  export type Event = {
    notification: {
      data?: Record<string, unknown>;
      from?: string;
      notification: Notification;
      priority?: 'string';
    };
    persistentId?: string;
  };

  export class Client {
    connect(): Promise<void>;
    destroy(): void;
  }

  export function listen(
    args: Credentials & { persistentIds: Array<string> },
    callback: (args: Event) => void
  ): Promise<Client>;

  export function register(senderID: string): Promise<Credentials>;
}
