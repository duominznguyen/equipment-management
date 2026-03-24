export interface Technician {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  specialization?: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
  };
}

export interface PaginatedTechnicians {
  data: Technician[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
