export interface Ticket {
  id: number;
  deviceId: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "processing" | "resolved" | "closed" | "rejected";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  device: {
    id: number;
    name: string;
    serialNumber: string;
    customer?: {
      id: number;
      fullName: string;
      phone?: string;
    } | null;
  };
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
