/* eslint-disable no-console */
import cron from 'node-cron';
import providers from './providers';
import config from './easyddns.config.json';
import BaseIPProvider from './base/IpProvider';
import BaseDnsProvider from './base/DnsProvider';

const ipProvider: BaseIPProvider = new providers.ip[config.providers.ip.use](
  config.providers.ip.config,
);
const dnsProvider: BaseDnsProvider = new providers.ip[config.providers.dns.use](
  config.providers.dns.config,
);

if (!ipProvider) {
  console.error('Cannot get the ip provider.');
  process.exit(-1);
}

if (!dnsProvider) {
  console.error('Cannot get the dns provider.');
  process.exit(-1);
}

cron.schedule(config.cron, async () => {
  const ip = await ipProvider.query();
  if (!ip) {
    console.error('Failed to fetch ip from provider.');
    return;
  }
  console.log('IP fetched.', ip);
  await dnsProvider.update(ip);
});
