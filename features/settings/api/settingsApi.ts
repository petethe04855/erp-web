import { read, writeRecord } from "@/lib/api";
export interface Company {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  vatRate: number;
  invoicePrefix: string;
  soPrefix: string;
  logoUrl: string;
  defaultReorderPoint?: number;
}
export interface LivePayrollSettings {
  hourlyRate: number;
  clipBonus: number;
  staffRates: Record<string, number>;
}

export interface Settings {
  company: Company;
  livePayroll?: LivePayrollSettings;
}

export const settingsApi = {
  get: () => read<Settings>("/settings"),
  save: (company: Company) =>
    writeRecord<Settings>("/settings", { company }, "put"),
  saveLivePayroll: (livePayroll: LivePayrollSettings) =>
    writeRecord<Settings>("/settings", { livePayroll }, "put"),
};
