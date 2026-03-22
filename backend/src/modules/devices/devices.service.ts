import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.device, params, {
    include: {
      category: true,
      customer: { select: { id: true, fullName: true, companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      category: true,
      customer: {
        select: { id: true, fullName: true, phone: true, companyName: true },
      },
      warrantyContracts: true,
    },
  });
  if (!device) throw new Error("Thiết bị không tồn tại");
  return device;
};

export const getByCustomer = async (customerId: number, query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.device, params, {
    where: { customerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

export const create = async (data: {
  categoryId: number;
  customerId: number;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate?: string;
  status?: string;
}) => {
  const existing = await prisma.device.findUnique({
    where: { serialNumber: data.serialNumber },
  });
  if (existing) throw new Error("Số serial đã tồn tại");
  return prisma.device.create({
    data: {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      status: data.status || "active",
    },
    include: {
      category: true,
      customer: { select: { id: true, fullName: true, companyName: true } },
    },
  });
};

export const update = async (
  id: number,
  data: {
    categoryId?: number;
    name?: string;
    brand?: string;
    model?: string;
    purchaseDate?: string;
    status?: string;
  },
) => {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new Error("Thiết bị không tồn tại");
  return prisma.device.update({
    where: { id },
    data: {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    },
    include: {
      category: true,
      customer: { select: { id: true, fullName: true, companyName: true } },
    },
  });
};

export const remove = async (id: number) => {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new Error("Thiết bị không tồn tại");
  return prisma.device.delete({ where: { id } });
};
