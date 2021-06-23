/* eslint-disable no-console */
import axios from 'axios';
import LRUCache from 'lru-cache';
import BaseDnsProvider from '../../base/DnsProvider';
import { HttpRequestMethod } from '../../constants/enum';
import { md5 } from '../../utils/hash';

interface DNSPodProviderConfig {
  loginToken: string;
  domain: string;
  subDomain: string;
}

interface DNSPodCommonHeaders {
  login_token: string;
  lang: string;
  format: string;
  error_on_empty: string;
}

class DnsPodDNSProvider implements BaseDnsProvider {
  private config: DNSPodProviderConfig;
  private commonParams: DNSPodCommonHeaders;
  private recordIdCache: LRUCache<string, string>;
  private lastUpdateIP: string | null;
  constructor(config: DNSPodProviderConfig) {
    this.config = Object.assign(
      {
        subDomain: '@',
      },
      config,
    );
    this.commonParams = {
      login_token: this.config.loginToken,
      lang: 'en',
      format: 'json',
      error_on_empty: 'no',
    };
    this.recordIdCache = new LRUCache({
      maxAge: 30 * 1000,
      updateAgeOnGet: false,
    });
  }
  async update(ip: string) {
    if (this.lastUpdateIP && this.lastUpdateIP === ip) {
      return;
    }
    let recordId = await this.fetchRecordId();
    if (!recordId) {
      // try to create
      recordId = await this.createRecord(ip);
      if (!recordId) {
        console.error('Failed to update dns record: cannot get the record ID.');
        return;
      }
    }
    await this.modifyRecord(recordId, ip);
    this.lastUpdateIP = ip;
  }
  private async sendRequest({
    method,
    path,
    params,
  }: {
    method: HttpRequestMethod;
    path: string;
    params: Record<string, string>;
  }) {
    const requestUrl = `https://dnsapi.cn/${path}`;
    const mergedParams = Object.assign(params, this.commonParams);
    if (method === HttpRequestMethod.GET) {
      return axios.get(requestUrl, {
        params: mergedParams,
      });
    } else {
      return axios.post(requestUrl, mergedParams);
    }
  }
  private async fetchRecordId() {
    const cacheKey = md5(`${this.config.subDomain}/${this.config.domain}`);
    const cachedId = this.recordIdCache.get(cacheKey);
    if (cachedId) {
      return cachedId;
    }
    const recordList = await this.sendRequest({
      method: HttpRequestMethod.GET,
      path: 'Record.List',
      params: {
        domain: this.config.domain,
        sub_domain: this.config.subDomain,
      },
    });
    if (recordList.data.status !== '1') {
      console.error('Cannot fetch the ID of the specified record.');
      return;
    }
    // cache record id
    if (!recordList.data.records.length) {
      console.error('Cannot find the specified record.');
      return;
    }
    const record = recordList.data.records[0];
    if (!record) {
      console.error('Failed to read record data.');
      return;
    }
    const { id: recordId } = record;
    this.recordIdCache.set(cacheKey, recordId);
    return recordId;
  }
  private async createRecord(ip: string) {
    const res = await this.sendRequest({
      method: HttpRequestMethod.POST,
      path: 'Record.Create',
      params: {
        domain: this.config.domain,
        sub_domain: this.config.subDomain,
        record_type: 'A',
        record_line: '默认',
        value: ip,
      },
    });
    if (res.data.status.code !== '1') {
      console.error('Failed to create the record:', res.data.status.message);
      return null;
    }
    return res.data.record.id;
  }
  private async modifyRecord(recordId: string, ip: string) {
    const res = await this.sendRequest({
      method: HttpRequestMethod.POST,
      path: 'Record.Modify',
      params: {
        record_id: recordId,
        domain: this.config.domain,
        sub_domain: this.config.subDomain,
        record_type: 'A',
        value: ip,
      },
    });
    if (res.data.status.code !== '1') {
      console.error('Failed to modify the record:', res.data.status.message);
      return false;
    }
    return true;
  }
}

export default DnsPodDNSProvider;
