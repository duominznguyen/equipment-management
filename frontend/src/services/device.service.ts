import api from "./api";

export const getDevices = async (page = 1, pageSize = 10) => {
  const res = await api.get("/devices", { params: { page, pageSize } });
  return res.data;
};

export const createDevice = async (data: {
  categoryId: number;
  customerId: number;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate?: string;
  status?: string;
}) => {
  const res = await api.post("/devices", data);
  return res.data;
};

export const updateDevice = async (
  id: number,
  data: {
    categoryId?: number;
    customerId?: number;
    name?: string;
    brand?: string;
    model?: string;
    purchaseDate?: string;
    status?: string;
  },
) => {
  const res = await api.put(`/devices/${id}`, data);
  return res.data;
};

export const deleteDevice = async (id: number) => {
  const res = await api.delete(`/devices/${id}`);
  return res.data;
};
export const getMyDevices = async (customerId: number, page = 1, pageSize = 100) => {
  const res = await api.get(`/devices/customer/${customerId}`, { params: { page, pageSize } });
  return res.data;
};
