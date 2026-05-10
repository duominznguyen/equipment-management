export interface Technician {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  technicianSkills: {
    deviceCategoryId: number;
    deviceCategory: {
      id: number;
      name: string;
    };
  }[];
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    lockReason?: string | null;
  };
}

export interface PaginatedTechnicians {
  data: Technician[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
