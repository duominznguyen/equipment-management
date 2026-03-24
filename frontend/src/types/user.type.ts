export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "technician" | "customer";
  isActive: boolean;
  createdAt: string;
  customer?: { fullName: string; phone: string } | null;
  technician?: { fullName: string; phone: string } | null;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
