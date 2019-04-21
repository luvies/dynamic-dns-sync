import { Route53 } from 'aws-sdk';
import { Route53Config } from '../env';
import { DnsBase } from './base';

export class DnsRoute53 implements DnsBase {
  private static _r53: Route53 | undefined;
  private static get r53(): Route53 {
    if (!DnsRoute53._r53) {
      DnsRoute53._r53 = new Route53({
        apiVersion: '2013-04-01',
      });
    }
    return DnsRoute53._r53;
  }

  private readonly _r53 = DnsRoute53.r53;

  public constructor(private readonly _conf: Route53Config) {}

  public async sync(ip: string): Promise<void> {
    try {
      await this._r53
        .changeResourceRecordSets({
          HostedZoneId: this._conf.zone,
          ChangeBatch: {
            Changes: this._conf.records.map<Route53.Change>(record => ({
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: record,
                ResourceRecords: [
                  {
                    Value: ip,
                  },
                ],
                TTL: 60,
                Type: 'A',
              },
            })),
          },
        })
        .promise();
    } catch (err) {
      console.error(`Failed to update R53, reason: ${err}`);
    }
  }
}
