export interface Customer {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  additionalInfo?: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    lockReason?: string | null;
  };
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
