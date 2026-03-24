import api from "./api";

export const getTechnicians = async (page = 1, pageSize = 10) => {
  const res = await api.get("/technicians", { params: { page, pageSize } });
  return res.data;
};

export const createTechnician = async (data: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  specialization?: string;
}) => {
  const res = await api.post("/technicians", data);
  return res.data;
};

export const updateTechnician = async (
  id: number,
  data: {
    fullName?: string;
    phone?: string;
    specialization?: string;
  },
) => {
  const res = await api.put(`/technicians/${id}`, data);
  return res.data;
};

export const deleteTechnician = async (id: number) => {
  const res = await api.delete(`/technicians/${id}`);
  return res.data;
};
