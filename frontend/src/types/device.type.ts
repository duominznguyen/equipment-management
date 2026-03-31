export interface Device {
  id: number;
  categoryId: number;
  customerId: number;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate?: string | null;
  status: "active" | "maintaining" | "broken";
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    fullName: string;
    companyName?: string | null;
  };
}

export interface PaginatedDevices {
  data: Device[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
