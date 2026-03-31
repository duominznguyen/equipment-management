import api from "./api";

export const getWarrantyContracts = async (page = 1, pageSize = 10) => {
  const res = await api.get("/warranty-contracts", { params: { page, pageSize } });
  return res.data;
};

export const createWarrantyContract = async (data: {
  deviceId: number;
  customerId: number;
  contractNumber: string;
  startDate: string;
  endDate: string;
  terms?: string;
}) => {
  const res = await api.post("/warranty-contracts", data);
  return res.data;
};

export const updateWarrantyContract = async (
  id: number,
  data: {
    startDate?: string;
    endDate?: string;
    terms?: string;
  },
) => {
  const res = await api.put(`/warranty-contracts/${id}`, data);
  return res.data;
};

export const deleteWarrantyContract = async (id: number) => {
  const res = await api.delete(`/warranty-contracts/${id}`);
  return res.data;
};
