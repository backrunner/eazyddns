import DnsPodDNSProvider from './dns/dnspod';
import CustomIPProvider from './ip/custom';
import TaobaoIPProvider from './ip/taobao';

export default {
  dns: {
    dnspod: DnsPodDNSProvider,
  },
  ip: {
    taobao: TaobaoIPProvider,
    custom: CustomIPProvider,
  },
};
