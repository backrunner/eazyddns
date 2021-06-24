import axios, { AxiosResponse } from 'axios';
import { Logger } from 'log4js';
import { ipv4LooseTester } from 'regex-go';
import BaseIPProvider from '../../base/IpProvider';

class TaobaoIPProvider implements BaseIPProvider {
  private config: Record<string, string> | null;
  private logger: Logger;
  constructor(config: Record<string, string> | null, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  async query(): Promise<string | null> {
    this.logger.debug('Starting fetching ip...');
    let res: AxiosResponse;
    try {
      res = await axios.get('https://www.taobao.com/help/getip.php');
    } catch (err) {
      this.logger.error('Failed to fetch ip from taobao helper.');
      return null;
    }
    const matches = ipv4LooseTester.exec(res.data);
    if (!matches || !matches.length) {
      return null;
    }
    return matches[0];
  }
}

export default TaobaoIPProvider;
