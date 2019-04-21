import 'source-map-support/register';

import ms = require('ms');
import fetch from 'node-fetch';
import { DnsBase } from './dns/base';
import { DnsConfig, EnvError, loadConfig } from './env';
import { loop } from './loop';

const checkIpUrl = 'http://checkip.amazonaws.com';

async function fetchCurrentIp(): Promise<string | undefined> {
  try {
    const resp = await fetch(checkIpUrl);

    if (resp.ok) {
      const ip = await resp.text();

      return ip.trim();
    }
  } catch {
    // Ignore fetch errors.
  }

  return undefined;
}

async function main(): Promise<number> {
  let conf: DnsConfig;

  try {
    conf = loadConfig();
  } catch (err) {
    if (err instanceof EnvError) {
      console.log(err.message);
      return 1;
    } else {
      throw err;
    }
  }

  const dns: DnsBase[] = [];

  if (conf.r53.length > 0) {
    const { DnsRoute53 } = await import('./dns/route53');

    for (const c of conf.r53) {
      dns.push(new DnsRoute53(c));
    }
  }

  if (conf.url.length > 0) {
    const { DnsUrl } = await import('./dns/url');

    for (const c of conf.url) {
      dns.push(new DnsUrl(c));
    }
  }

  if (dns.length === 0) {
    console.log('At least 1 domain sync vendor needs to be specified');
    return 1;
  }

  let currentIp: string | undefined;

  console.log(`Starting DNS loop with interval of ${ms(conf.interval)}`);

  for await (const _ of loop(conf.interval)) {
    const fetchedIp = await fetchCurrentIp();

    if (!fetchedIp || fetchedIp === currentIp) {
      continue;
    }

    if (!currentIp) {
      console.log('Performing initial DNS sync...');
    } else {
      console.log(`External IP change detected, performing DNS resync...`);
    }
    currentIp = fetchedIp;

    await Promise.all(dns.map(d => d.sync(fetchedIp)));
  }

  return 0;
}

main()
  .then(code => (process.exitCode = code))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

process.on('unhandledRejection', err => {
  throw err;
});
