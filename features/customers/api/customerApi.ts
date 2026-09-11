import { read, list, writeRecord, deleteRecord } from "@/lib/api";
import type { CustomerRecord } from "@/features/erp/types/records";
import type {
  Customer,
  CustomerQueryParams,
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "../types/customer";

const map = (c: CustomerRecord): Customer => ({ ...c, code: c.id });

// Clean-architecture customer endpoints return camelCase CustomerResponse
// (see erp-api-v2 internal/delivery/http/dto/customer_dto.go), which matches
// the frontend Customer type directly.
type CustomerResponse = Customer & {
  address: string;
  createdAt?: string;
  updatedAt?: string;
};

export const customerApi = {
  getCustomers: (params?: CustomerQueryParams) =>
    list<CustomerRecord, Customer>("/workspace/customers", params, map),
  getCustomerById: (id: string | number) =>
    read<CustomerResponse>(`/customers/${id}`),
  createCustomer: async (dto: CreateCustomerDTO) => {
    const res = await writeRecord<CustomerResponse>("/customers", {
      name: dto.name,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phone: dto.phone,
      taxId: dto.taxId,
      address: dto.address,
      channel: dto.channel,
    });
    return { ...res, data: map(res.data as CustomerRecord) };
  },
  updateCustomer: async (id: string | number, dto: UpdateCustomerDTO) => {
    const res = await writeRecord<CustomerResponse>(
      `/customers/${id}`,
      dto,
      "put",
    );
    return { ...res, data: map(res.data as CustomerRecord) };
  },
  updateCustomerStatus: async (id: string | number, status: string) => {
    return writeRecord<CustomerResponse>(`/customers/${id}/status`, {
      status,
    });
  },
  deleteCustomer: (id: string | number) => deleteRecord(`/customers/${id}`),
};
