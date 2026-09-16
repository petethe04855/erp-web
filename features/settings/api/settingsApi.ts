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
  uploadLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await (await import("@/lib/axios")).default.post<{
      success: boolean;
      data: { url: string };
      message?: string;
    }>("/upload/image?folder=logos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data?.success || !res.data?.data?.url) {
      throw new Error(res.data?.message || "อัปโหลดโลโก้ไม่สำเร็จ");
    }
    return res.data.data.url;
  },
};
