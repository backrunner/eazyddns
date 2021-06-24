/* eslint-disable no-console */
import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import LRUCache from 'lru-cache';
import { Logger } from 'log4js';
import BaseDnsProvider from '../../base/DnsProvider';
import { HttpRequestMethod } from '../../constants/enum';
import { md5 } from '../../utils/hash';

interface DNSPodProviderConfig {
  loginToken: string;
  domain: string;
  subDomain: string;
}

interface DNSPodCommonParams {
  login_token: string;
  lang: string;
  format: string;
  error_on_empty: string;
}

class DnsPodDNSProvider implements BaseDnsProvider {
  private config: DNSPodProviderConfig;
  private logger: Logger;
  private commonParams: DNSPodCommonParams;
  private recordIdCache: LRUCache<string, string>;
  private lastUpdateIP: string | null;
  constructor(config: DNSPodProviderConfig, logger: Logger) {
    this.logger = logger;
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
    this.logger.debug('Starting to fetch the record id...');
    let recordId: string;
    try {
      recordId = await this.fetchRecordId();
    } catch (err) {
      this.logger.error('Failed to fetch record id.', err.message);
      return;
    }
    if (!recordId) {
      // try to create
      this.logger.debug('Record does not exist, starting to create it...');
      recordId = await this.createRecord(ip);
      if (!recordId) {
        this.logger.error('Failed to update dns record: cannot get the record ID.');
        return;
      }
    }
    this.logger.debug('Record id fetched: ', recordId);
    this.logger.debug('Starting to modify the record...');
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
      return axios.post(requestUrl, qs.stringify(mergedParams, { encode: false }), {
        headers: {
          'User-Agent': 'easyddns/0.1.0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
  }
  private async fetchRecordId() {
    const cacheKey = md5(`${this.config.subDomain}/${this.config.domain}`);
    const cachedId = this.recordIdCache.get(cacheKey);
    if (cachedId) {
      return cachedId;
    }
    let recordList: AxiosResponse;
    try {
      recordList = await this.sendRequest({
        method: HttpRequestMethod.POST,
        path: 'Record.List',
        params: {
          domain: this.config.domain,
          sub_domain: this.config.subDomain,
        },
      });
    } catch (err) {
      this.logger.error('Failed to fetch record id.', err.message);
      throw err;
    }
    if (recordList.data.status.code !== '1') {
      this.logger.error('Cannot fetch the ID of the specified record.');
      throw new Error(recordList.data.status.message);
    }
    // cache record id
    if (!recordList.data.records.length) {
      this.logger.error('Cannot find the specified record.');
      return;
    }
    const record = recordList.data.records[0];
    if (!record) {
      this.logger.error('Failed to read record data.');
      return;
    }
    const { id: recordId } = record;
    this.recordIdCache.set(cacheKey, recordId);
    return recordId;
  }
  private async createRecord(ip: string) {
    let res: AxiosResponse;
    try {
      res = await this.sendRequest({
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
    } catch (err) {
      this.logger.error('Failed to create record.', err.message);
      return;
    }
    if (res.data.status.code !== '1') {
      this.logger.error('Failed to create the record:', res.data.status.message);
      return null;
    }
    this.logger.debug('Record has been created successfully.');
    this.lastUpdateIP = ip;
    return res.data.record.id;
  }
  private async modifyRecord(recordId: string, ip: string) {
    let res: AxiosResponse;
    try {
      res = await this.sendRequest({
        method: HttpRequestMethod.POST,
        path: 'Record.Modify',
        params: {
          record_id: recordId,
          domain: this.config.domain,
          sub_domain: this.config.subDomain,
          record_type: 'A',
          record_line: '默认',
          value: ip,
        },
      });
    } catch (err) {
      this.logger.error('Failed to modify the record.', err);
      return;
    }
    if (res.data.status.code !== '1') {
      this.logger.error('Failed to modify the record:', res.data.status.message);
      return false;
    }
    this.logger.debug('Record has been modified successfully.');
    return true;
  }
}

export default DnsPodDNSProvider;
