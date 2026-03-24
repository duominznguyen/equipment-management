import api from "./api";

export const getCustomers = async (page = 1, pageSize = 10) => {
  const res = await api.get("/customers", { params: { page, pageSize } });
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

export const updateCustomer = async (
  id: number,
  data: {
    fullName?: string;
    phone?: string;
    address?: string;
    companyName?: string;
  },
) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id: number) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};
