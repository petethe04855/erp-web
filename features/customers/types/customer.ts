export interface Customer {
  code: string;
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
}

export interface CustomerQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerDTO {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
}
