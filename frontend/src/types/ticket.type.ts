export interface Ticket {
  id: number;
  customerId: number;
  deviceId: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "processing" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    fullName: string;
    companyName?: string | null;
  };
  device: {
    id: number;
    name: string;
    serialNumber: string;
  };
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
