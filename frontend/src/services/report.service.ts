import api from "./api";

export const getOverview = async () => {
  const res = await api.get("/reports/overview");
  return res.data;
};

export const getMaintenanceReport = async (startDate?: string, endDate?: string) => {
  const res = await api.get("/reports/maintenance", {
    params: { startDate, endDate },
  });
  return res.data;
};

export const getPartsCostReport = async (startDate?: string, endDate?: string) => {
  const res = await api.get("/reports/parts-cost", {
    params: { startDate, endDate },
  });
  return res.data;
};
