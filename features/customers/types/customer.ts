export interface Customer {
  code: string;
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  address?: string;
  logo?: string;
  channel?: string;
  status?: string;
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
  address?: string;
  logo?: string;
  channel?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  logo?: string;
  channel?: string;
  status?: string;
}
