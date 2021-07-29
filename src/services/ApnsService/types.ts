import { Event } from 'push-receiver';

export type Apns = {
  'Simulator Target Bundle'?: string;
  aps: {
    'content-available'?: number;
    'mutable-content'?: number;
    alert: Event['notification']['notification'];
    badge?: number;
    data?: Event['notification']['data'];
  };
};

export type ApnsServiceOptions = {
  dir: string;
  targetBundle: string;
  targetDevice: string;
};
