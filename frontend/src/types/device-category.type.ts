export interface DeviceCategory {
  id: number;
  name: string;
  description?: string | null;
}

export interface PaginatedDeviceCategories {
  data: DeviceCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
