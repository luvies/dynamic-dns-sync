import ms from 'ms';

const defaultInterval = 5 * 60 * 1000;

const envInterval = 'DYN_DNS_CHECK_INTERVAL';
const reR53 = /^DYN_DNS_R53_(.+)$/g;
const reUrl = /^DYN_DNS_URL_(.+)$/g;

export class EnvError extends Error {}

export interface Route53Config {
  zone: string;
  records: string[];
}

export interface UrlConfig {
  url: string;
}

export interface DnsConfig {
  interval: number;
  r53: Route53Config[];
  url: UrlConfig[];
}

export function loadConfig(): DnsConfig {
  let interval = defaultInterval;

  const envIntervalValue = process.env[envInterval];
  if (envIntervalValue) {
    const givenInterval = ms(envIntervalValue);

    if (givenInterval === undefined) {
      throw new EnvError('Invalid interval format (see https://npm.im/ms)');
    }

    if (givenInterval < 1) {
      throw new EnvError('Check interval cannot be < 1ms');
    }

    interval = givenInterval;
  }

  const conf: DnsConfig = {
    interval,
    r53: [],
    url: [],
  };

  for (const [env, value] of Object.entries(process.env)) {
    // Route 53.
    let match = env.match(reR53);
    if (match) {
      const envErrorMsg = `Route 53 env var ${env} needs to be in the format '${env}={hosted zone ID},{records}+`;

      if (!value) {
        throw new EnvError(envErrorMsg);
      }

      const spl = value.split(',');
      if (spl.length < 2) {
        throw new EnvError(envErrorMsg);
      }

      conf.r53.push({
        zone: spl[0],
        records: spl.slice(1),
      });

      continue;
    }

    // URL-based DNS update.
    match = env.match(reUrl);
    if (match) {
      const envErrorMsg = `URL env var ${env} needs to be in the format '${env}={update URL}`;

      if (!value) {
        throw new EnvError(envErrorMsg);
      }

      conf.url.push({
        url: value,
      });

      continue;
    }
  }

  return conf;
}
