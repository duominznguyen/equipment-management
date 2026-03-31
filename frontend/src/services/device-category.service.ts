import api from "./api";

export const getDeviceCategories = async (page = 1, pageSize = 10) => {
  const res = await api.get("/device-categories", { params: { page, pageSize } });
  return res.data;
};

export const getAllDeviceCategories = async () => {
  const res = await api.get("/device-categories", { params: { page: 1, pageSize: 100 } });
  return res.data.data;
};

export const createDeviceCategory = async (data: { name: string; description?: string }) => {
  const res = await api.post("/device-categories", data);
  return res.data;
};

export const updateDeviceCategory = async (
  id: number,
  data: {
    name?: string;
    description?: string;
  },
) => {
  const res = await api.put(`/device-categories/${id}`, data);
  return res.data;
};

export const deleteDeviceCategory = async (id: number) => {
  const res = await api.delete(`/device-categories/${id}`);
  return res.data;
};
