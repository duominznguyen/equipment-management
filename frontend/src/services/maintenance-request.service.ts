import api from "./api";

export const getMaintenanceRequests = async (page = 1, pageSize = 10) => {
  const res = await api.get("/maintenance-requests", { params: { page, pageSize } });
  return res.data;
};

export const createMaintenanceRequest = async (data: {
  ticketId?: number;
  deviceId: number;
  technicianId: number;
  description: string;
  type: string;
}) => {
  const res = await api.post("/maintenance-requests", data);
  return res.data;
};

export const createFromTicket = async (
  ticketId: number,
  data: {
    technicianId: number;
    description: string;
  },
) => {
  const res = await api.post(`/maintenance-requests/from-ticket/${ticketId}`, data);
  return res.data;
};

export const updateMaintenanceRequest = async (
  id: number,
  data: {
    technicianId?: number;
    description?: string;
  },
) => {
  const res = await api.put(`/maintenance-requests/${id}`, data);
  return res.data;
};

export const updateMaintenanceStatus = async (id: number, status: string) => {
  const res = await api.patch(`/maintenance-requests/${id}/status`, { status });
  return res.data;
};
