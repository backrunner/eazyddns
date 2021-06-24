import axios from 'axios';
import { Logger } from 'log4js';
import { ipv4LooseTester } from 'regex-go';
import BaseIPProvider from '../../base/IpProvider';

interface CustomIPProviderConfig {
  api: 'string';
}

class CustomIPProvider implements BaseIPProvider {
  private config: CustomIPProviderConfig;
  private logger: Logger;
  constructor(config: CustomIPProviderConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  async query(): Promise<string | null> {
    this.logger.debug('Starting fetching ip...');
    let res;
    try {
      res = await axios.get(this.config.api);
    } catch (err) {
      this.logger.error('Failed to fetch ip.');
      return null;
    }
    const matches = ipv4LooseTester.exec(res.data);
    if (!matches || !matches.length) {
      return null;
    }
    return matches[0];
  }
}

export default CustomIPProvider;
