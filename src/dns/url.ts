import fetch from 'node-fetch';
import { UrlConfig } from '../env';
import { DnsBase } from './base';

export class DnsUrl implements DnsBase {
  public constructor(private readonly _conf: UrlConfig) {}

  public async sync(): Promise<void> {
    try {
      const res = await fetch(this._conf.url);

      if (!res.ok) {
        console.log(`${this._conf.url} returned status ${res.status}`);
      }
    } catch (err) {
      console.log(
        `Failed to connect to ${this._conf.url}, reason: ${err.message}`,
      );
    }
  }
}
