export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  expected: string;
}

export function getExpectedDnsRecords(host: string): DnsRecord[] {
  return [
    {
      type: "CNAME",
      name: `www.${host}`,
      value: "cname.goon.app",
      expected: "cname.goon.app",
    },
    {
      type: "A",
      name: host,
      value: "178.105.231.73",
      expected: "178.105.231.73",
    },
  ];
}
