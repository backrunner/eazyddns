/* eslint-disable no-console */
import cron from 'node-cron';
import providers from './providers';
import logger from './utils/logger';
import config from './easyddns.config.json';

const IPProviderFactory = providers.ip[config.providers.ip.use];
const DNSProviderFactory = providers.dns[config.providers.dns.use];

if (!IPProviderFactory) {
  logger.error('The IP provider does not exist.');
  process.exit(-1);
}

if (!DNSProviderFactory) {
  logger.error('The DNS provider does not exist.');
  process.exit(-1);
}

const ipProvider = new IPProviderFactory(config.providers.ip.config || {}, logger);
const dnsProvider = new DNSProviderFactory(config.providers.dns.config || {}, logger);

if (!ipProvider) {
  logger.error('Cannot get the ip provider.');
  process.exit(-1);
}

if (!dnsProvider) {
  logger.error('Cannot get the dns provider.');
  process.exit(-1);
}

cron.schedule(config.cron, async () => {
  const ip = await ipProvider.query();
  if (!ip) {
    logger.error('Failed to fetch ip from provider.');
    return;
  }
  logger.debug('IP fetched:', ip);
  await dnsProvider.update(ip);
});
