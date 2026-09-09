import { list, writeRecord } from "@/lib/api";
import type { CustomerRecord } from "@/features/erp/types/records";
import type {
  Customer,
  CustomerQueryParams,
  CreateCustomerDTO,
} from "../types/customer";
const map = (c: CustomerRecord): Customer => ({ ...c, code: c.id });
export const customerApi = {
  getCustomers: (params?: CustomerQueryParams) =>
    list<CustomerRecord, Customer>("/workspace/customers", params, map),
  createCustomer: async (dto: CreateCustomerDTO) => {
    const res = await writeRecord<CustomerRecord>("/customers", {
      name: dto.name,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phone: dto.phone,
      taxId: dto.taxId,
    });
    return { ...res, data: map(res.data) };
  },
};
