import api from "./api";

export const getMaintenanceSchedules = async (page = 1, pageSize = 10) => {
  const res = await api.get("/maintenance-schedules", { params: { page, pageSize } });
  return res.data;
};

export const getMySchedules = async (page = 1, pageSize = 10) => {
  const res = await api.get("/maintenance-schedules/my", { params: { page, pageSize } });
  return res.data;
};

export const createMaintenanceSchedule = async (data: {
  deviceId: number;
  technicianId: number;
  scheduledDate: string;
  description?: string;
}) => {
  const res = await api.post("/maintenance-schedules", data);
  return res.data;
};

export const updateMaintenanceSchedule = async (
  id: number,
  data: {
    technicianId?: number;
    scheduledDate?: string;
    description?: string;
  },
) => {
  const res = await api.put(`/maintenance-schedules/${id}`, data);
  return res.data;
};

export const updateScheduleStatus = async (id: number, status: string) => {
  const res = await api.patch(`/maintenance-schedules/${id}/status`, { status });
  return res.data;
};

export const deleteMaintenanceSchedule = async (id: number) => {
  const res = await api.delete(`/maintenance-schedules/${id}`);
  return res.data;
};
