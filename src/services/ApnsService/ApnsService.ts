import { spawn } from 'child_process';
import fs from 'fs';
import hash from 'object-hash';
import { Event } from 'push-receiver';
import { pipe, when } from 'ramda';
import { Subject } from 'rxjs';
import { isNotEmpty } from '../../utils/logic';
import { isMac } from '../../utils/os';
import { Apns, ApnsServiceOptions } from './types';

/**
 * APNS Service
 *
 * Handles all functionality in relation to the APNS
 * json build and push
 */
export class ApnsService {
  private dir: string;
  private targetBundle: string;
  private targetDevice: string;

  apnsPaths$ = new Subject<string>();

  constructor({ targetBundle, targetDevice, dir }: ApnsServiceOptions) {
    this.dir = dir;
    this.targetBundle = targetBundle;
    this.targetDevice = targetDevice;

    // Listen for new paths and execute them
    // when they are built
    this.apnsPaths$.subscribe(this.execute);
  }

  /**
   * Build a path based on the APNS object
   * and the write dir
   *
   * @param {object} apns
   */
  private buildApnsPathName = (apns: Apns) => `${this.dir}/${hash(apns)}.apns`;

  /**
   * Execute the APNS file via xcrun
   *
   * @param {string} apnsPath
   */
  private execute = (apnsPath: string) => {
    if (!isMac()) {
      console.warn('APNS can only be executed on a mac');
      return;
    }

    spawn('xcrun', ['simctl', 'push', this.targetDevice, this.targetBundle, apnsPath]);
  };

  /**
   * Persist an APNS object to disk
   *
   * @param {object} apns
   */
  persistApns = (apns: Apns) => {
    const fileName = this.buildApnsPathName(apns);

    try {
      fs.writeFileSync(fileName, JSON.stringify(apns));
      return fileName;
    } catch (e) {
      return '';
    }
  };

  /**
   * Creates an APNS from an FCM event
   *
   * @param {object} event
   */
  createApnsFromEvent = (event: Event): Apns => ({
    aps: {
      alert: event.notification.notification,
      data: event.notification.data,
    },
    'Simulator Target Bundle': this.targetBundle,
  });

  /**
   * Takes an FCM event and runs it through
   * APNS creation, peristing and then pushes
   * it to the observable to be executed
   *
   * @param {object} event
   */
  triggerApnsFromEvent = pipe(this.createApnsFromEvent, this.persistApns, when(isNotEmpty, this.apnsPaths$.next));
}
