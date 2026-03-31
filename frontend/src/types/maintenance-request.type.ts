export interface MaintenanceRequest {
  id: number;
  ticketId?: number | null;
  deviceId: number;
  technicianId: number;
  description: string;
  type: "repair" | "periodic";
  status: "pending" | "processing" | "completed";
  startedAt?: string | null;
  completedAt?: string | null;
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
  ticket?: {
    id: number;
    title: string;
  } | null;
}

export interface PaginatedMaintenanceRequests {
  data: MaintenanceRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
