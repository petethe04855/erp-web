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
export interface Settings {
  company: Company;
}
export const settingsApi = {
  get: () => read<Settings>("/settings"),
  save: (company: Company) =>
    writeRecord<Settings>("/settings", { company }, "put"),
};
