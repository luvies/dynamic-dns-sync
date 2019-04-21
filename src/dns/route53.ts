import { Route53Config } from '../env';
import { DnsBase } from './base';

export class DnsRoute53 implements DnsBase {
  public constructor(private readonly _conf: Route53Config) {}

  public async sync(): Promise<void> {
    console.log(this._conf);
    throw new Error('Not Implemented');
  }
}
