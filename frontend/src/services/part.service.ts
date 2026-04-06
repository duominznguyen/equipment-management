import api from "./api";

export const getParts = async (page = 1, pageSize = 10) => {
  const res = await api.get("/parts", { params: { page, pageSize } });
  return res.data;
};

export const getAllParts = async () => {
  const res = await api.get("/parts", { params: { page: 1, pageSize: 100 } });
  return res.data.data;
};

export const createPart = async (data: {
  name: string;
  code: string;
  unit: string;
  stockQuantity?: number;
  minQuantity?: number;
  description?: string;
}) => {
  const res = await api.post("/parts", data);
  return res.data;
};

export const updatePart = async (
  id: number,
  data: {
    name?: string;
    unit?: string;
    minQuantity?: number;
    description?: string;
  },
) => {
  const res = await api.put(`/parts/${id}`, data);
  return res.data;
};

export const deletePart = async (id: number) => {
  const res = await api.delete(`/parts/${id}`);
  return res.data;
};

// Part Imports
export const getPartImports = async (page = 1, pageSize = 10) => {
  const res = await api.get("/part-imports", { params: { page, pageSize } });
  return res.data;
};

export const createPartImport = async (data: {
  importCode: string;
  supplier: string;
  importDate: string;
  note?: string;
  details: { partId: number; quantity: number; unitPrice: number }[];
}) => {
  const res = await api.post("/part-imports", data);
  return res.data;
};

// Part Exports
export const getPartExports = async (page = 1, pageSize = 10) => {
  const res = await api.get("/part-exports", { params: { page, pageSize } });
  return res.data;
};

export const createPartExport = async (data: {
  exportCode: string;
  maintenanceRequestId: number;
  exportDate: string;
  note?: string;
  details: { partId: number; quantity: number; unitPrice: number }[];
}) => {
  const res = await api.post("/part-exports", data);
  return res.data;
};
