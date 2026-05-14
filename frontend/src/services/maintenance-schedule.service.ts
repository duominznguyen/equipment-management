import api from "./api";

export const getMaintenanceSchedules = async (page = 1, pageSize = 10, filters?: any) => {
  const res = await api.get("/maintenance-schedules", { params: { page, pageSize, ...filters } });
  return res.data;
};

export const getMySchedules = async (page = 1, pageSize = 10, filters?: any) => {
  const res = await api.get("/maintenance-schedules/my", { params: { page, pageSize, ...filters } });
  return res.data;
};

export const getMaintenanceScheduleById = async (id: number) => {
  const res = await api.get(`/maintenance-schedules/${id}`);
  return res.data;
};

export const createMaintenanceSchedule = async (data: {
  deviceId: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  leadTimeDays?: number;
  isHandled?: boolean;
  isContinueMaintain?: boolean;
}) => {
  const res = await api.post("/maintenance-schedules", data);
  return res.data;
};

export const updateMaintenanceSchedule = async (
  id: number,
  data: {
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    leadTimeDays?: number;
    isHandled?: boolean;
    isContinueMaintain?: boolean;
  },
) => {
  const res = await api.put(`/maintenance-schedules/${id}`, data);
  return res.data;
};

export const updateScheduleStatus = async (id: number, isHandled: boolean) => {
  const res = await api.patch(`/maintenance-schedules/${id}/status`, { isHandled });
  return res.data;
};

export const deleteMaintenanceSchedule = async (id: number) => {
  const res = await api.delete(`/maintenance-schedules/${id}`);
  return res.data;
};
