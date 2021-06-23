import axios from 'axios';
import { ipv4Tester } from 'regex-go';
import BaseIPProvider from '../../base/IpProvider';

interface CustomIPProviderConfig {
  api: 'string';
}

class CustomIPProvider implements BaseIPProvider {
  private config: CustomIPProviderConfig;
  constructor(config: CustomIPProviderConfig) {
    this.config = config;
  }
  async query(): Promise<string | null> {
    const res = await axios.get(this.config.api);
    const matches = ipv4Tester.exec(res.data);
    if (!matches || !matches.length) {
      return null;
    }
    return matches[0];
  }
}

export default CustomIPProvider;
