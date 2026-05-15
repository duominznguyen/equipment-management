import api from "./api";

export const getWorkOrders = async (page = 1, pageSize = 10, filters?: any) => {
  const res = await api.get("/work-orders", { params: { page, pageSize, ...filters } });
  return res.data;
};

export const getWorkOrderById = async (id: number) => {
  const res = await api.get(`/work-orders/${id}`);
  return res.data;
};

export const createWorkOrder = async (data: {
  ticketId?: number;
  maintenanceScheduleId?: number;
  technicianId: number;
  workDescription?: string;
}) => {
  const res = await api.post("/work-orders", data);
  return res.data;
};

export const createWorkOrderFromTicket = async (data: {
  ticketId: number;
  technicianId: number;
  workDescription?: string;
}) => {
  const res = await api.post("/work-orders/from-ticket", data);
  return res.data;
};

export const updateWorkOrder = async (
  id: number,
  data: {
    technicianId?: number;
    workDescription?: string;
  },
) => {
  const res = await api.patch(`/work-orders/${id}`, data);
  return res.data;
};

export const updateWorkOrderStatus = async (id: number, status: string) => {
  const res = await api.patch(`/work-orders/${id}/status`, { status });
  return res.data;
};

export const deleteWorkOrder = async (id: number) => {
  const res = await api.delete(`/work-orders/${id}`);
  return res.data;
};

export const addPartUsage = async (
  id: number,
  data: { partId: number; quantityUsage: number }
) => {
  const res = await api.post(`/work-orders/${id}/parts`, data);
  return res.data;
};

export const removePartUsage = async (usageId: number) => {
  const res = await api.delete(`/work-orders/parts/${usageId}`);
  return res.data;
};
