import { read, writeRecord } from "@/lib/api";
export type Resource =
  | "products"
  | "customers"
  | "sales-orders"
  | "invoices"
  | "quotations"
  | "purchase-orders"
  | "goods-receives"
  | "goods-issues";
export interface RecordDetail {
  id: string | number;
  code?: string;
  status?: string;
  [key: string]: unknown;
}
export const recordApi = {
  get: async (resource: Resource, id: string | number) => {
    const record = await read<RecordDetail>(
      "/" + resource + "/" + encodeURIComponent(id),
    );
    if (resource === "products" && record.isBundle)
      record.components = await read<unknown[]>(
        "/bundle-components/" + encodeURIComponent(id),
      );
    return record;
  },
  status: (resource: Resource, id: string | number, status: string) =>
    writeRecord(
      "/" + resource + "/" + encodeURIComponent(id) + "/status",
      { status, note: "Updated from Chawy workspace" },
      "put",
    ),
  convert: (id: string | number) =>
    writeRecord("/quotations/" + encodeURIComponent(id) + "/convert", {}),
  pay: (id: string | number, amount: number) =>
    // Account/method selection belongs to the backend payment workflow;
    // frontend only submits the collected amount.
    writeRecord("/invoices/" + encodeURIComponent(id) + "/payment", {
      amount,
    }),
};
