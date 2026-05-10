import api from "./api";

export const getCustomers = async (page = 1, pageSize = 10, filters?: any) => {
  const res = await api.get("/customers", { params: { page, pageSize, ...filters } });
  return res.data;
};

export const createCustomer = async (data: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  companyName?: string;
}) => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id: number, data: any) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const toggleLockCustomer = async (id: number, isActive: boolean, lockReason?: string) => {
  const res = await api.patch(`/customers/${id}/lock`, { isActive, lockReason });
  return res.data;
};

export const deleteCustomer = async (id: number) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};
