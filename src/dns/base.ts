export interface DnsBase {
  sync(ip: string): Promise<void>;
}
