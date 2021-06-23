import axios from 'axios';
import { ipv4Tester } from 'regex-go';
import BaseIPProvider from '../../base/IpProvider';

class TaobaoIPProvider implements BaseIPProvider {
  async query(): Promise<string | null> {
    const res = await axios.get('https://www.taobao.com/help/getip.php');
    const matches = ipv4Tester.exec(res.data);
    if (!matches || !matches.length) {
      return null;
    }
    return matches[0];
  }
}

export default TaobaoIPProvider;
