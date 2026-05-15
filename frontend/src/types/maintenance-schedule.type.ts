export interface MaintenanceSchedule {
  id: number;
  deviceId: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate?: string | null;
  maintenanceIntervalDays: number;
  leadTimeDays: number;
  isHandled: boolean;
  isContinueMaintain: boolean;
  device: {
    id: number;
    name: string;
    serialNumber: string;
    categoryId?: number;
    customer?: {
      id: number;
      fullName: string;
      additionalInfo?: string | null;
    };
  };
  _count?: {
    workOrders: number;
  };
  workOrders?: any[];
}

export interface PaginatedMaintenanceSchedules {
  data: MaintenanceSchedule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
