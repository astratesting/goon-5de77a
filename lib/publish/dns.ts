import { promises as dns } from "dns";
import { getExpectedDnsRecords } from "./dns-records";

export interface DnsCheckResult {
  record: string;
  expected: string;
  actual: string[];
  ok: boolean;
}

export { getExpectedDnsRecords } from "./dns-records";
export type { DnsRecord } from "./dns-records";

export async function checkDns(host: string): Promise<DnsCheckResult[]> {
  const records = getExpectedDnsRecords(host);
  const results: DnsCheckResult[] = [];

  for (const record of records) {
    try {
      if (record.type === "CNAME") {
        const addresses = await dns.resolveCname(record.name);
        results.push({
          record: `${record.type} ${record.name}`,
          expected: record.expected,
          actual: addresses,
          ok: addresses.some((a) => a === record.expected || a === record.expected + "."),
        });
      } else if (record.type === "A") {
        const addresses = await dns.resolve4(record.name);
        results.push({
          record: `${record.type} ${record.name}`,
          expected: record.expected,
          actual: addresses,
          ok: addresses.includes(record.expected),
        });
      }
    } catch {
      results.push({
        record: `${record.type} ${record.name}`,
        expected: record.expected,
        actual: [],
        ok: false,
      });
    }
  }

  return results;
}
