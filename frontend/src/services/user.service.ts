import api from "./api";

export const getUsers = async (page = 1, pageSize = 10) => {
  const res = await api.get("/users", { params: { page, pageSize } });
  return res.data;
};

export const createUser = async (data: { username: string; password: string; email: string; role: string }) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUser = async (
  id: number,
  data: {
    email?: string;
    role?: string;
  },
) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const toggleActiveUser = async (id: number) => {
  const res = await api.patch(`/users/${id}/toggle-active`);
  return res.data;
};
