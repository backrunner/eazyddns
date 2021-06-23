abstract class BaseDnsProvider {
  abstract update(ip: string): Promise<void>;
}

export default BaseDnsProvider;
