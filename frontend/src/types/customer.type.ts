export interface Customer {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  companyName?: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
  };
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
