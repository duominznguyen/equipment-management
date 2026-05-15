import type { Part } from "./part.type";

export interface PartUsage {
  id: number;
  workOrderId: number;
  partId: number;
  quantityUsage: number;
  part?: Part;
}

export interface WorkOrder {
  id: number;
  ticketId?: number | null;
  maintenanceScheduleId?: number | null;
  technicianId: number;
  workDescription?: string | null;
  status: "pending" | "processing" | "in_progress" | "completed";
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  
  ticket?: {
    id: number;
    title: string;
    device?: { id: number; name: string; serialNumber: string };
  } | null;
  
  maintenanceSchedule?: {
    id: number;
    nextMaintenanceDate?: string;
    device?: { id: number; name: string; serialNumber: string };
  } | null;
  
  technician?: {
    id: number;
    fullName: string;
    phone?: string;
  };
  
  partUsages?: PartUsage[];
}

export interface PaginatedWorkOrders {
  data: WorkOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
