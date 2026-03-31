export interface WarrantyContract {
  id: number;
  deviceId: number;
  customerId: number;
  contractNumber: string;
  startDate: string;
  endDate: string;
  terms?: string | null;
  status: "active" | "expiring_soon" | "expired";
  createdAt: string;
  device: {
    id: number;
    name: string;
    serialNumber: string;
  };
  customer: {
    id: number;
    fullName: string;
    companyName?: string | null;
  };
}

export interface PaginatedWarrantyContracts {
  data: WarrantyContract[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
