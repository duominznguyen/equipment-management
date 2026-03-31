import api from "./api";

export const getTickets = async (page = 1, pageSize = 10) => {
  const res = await api.get("/tickets", { params: { page, pageSize } });
  return res.data;
};

export const getMyTickets = async (page = 1, pageSize = 10) => {
  const res = await api.get("/tickets/my", { params: { page, pageSize } });
  return res.data;
};

export const createTicket = async (data: {
  deviceId: number;
  title: string;
  description: string;
  priority?: string;
}) => {
  const res = await api.post("/tickets", data);
  return res.data;
};

export const updateTicketStatus = async (id: number, status: string) => {
  const res = await api.patch(`/tickets/${id}/status`, { status });
  return res.data;
};

export const deleteTicket = async (id: number) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};
