export interface MaintenanceSchedule {
  id: number;
  deviceId: number;
  technicianId: number;
  scheduledDate: string;
  description?: string | null;
  status: "upcoming" | "completed" | "overdue";
  createdAt: string;
  device: {
    id: number;
    name: string;
    serialNumber: string;
  };
  technician: {
    id: number;
    fullName: string;
  };
}

export interface PaginatedMaintenanceSchedules {
  data: MaintenanceSchedule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
