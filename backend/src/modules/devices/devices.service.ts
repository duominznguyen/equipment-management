import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, sortBy, sortOrder, status, categoryId, customerId, startDate, endDate } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const parsedId = parseInt(term.replace(/^KH/i, ""), 10);
      const orConditions: any[] = [
        { name: { contains: term } },
        { serialNumber: { contains: term } },
        { brand: { contains: term } },
        { model: { contains: term } },
        { customer: { fullName: { contains: term } } },
      ];
      
      if (!isNaN(parsedId)) {
        orConditions.push({ customerId: parsedId });
      }

      return { OR: orConditions };
    });
  }

  if (startDate || endDate) {
    where.purchaseDate = {};
    if (startDate) {
      where.purchaseDate.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.purchaseDate.lte = end;
    }
  }

  if (status && status !== "all") {
    where.status = status;
  }

  if (categoryId && categoryId !== "all") {
    where.categoryId = Number(categoryId);
  }

  if (customerId) {
    where.customerId = Number(customerId);
  }

  const orderBy: any = {};
  if (sortBy === "name" || sortBy === "serialNumber" || sortBy === "brand" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  return paginate(prisma.device, params, {
    where,
    include: {
      category: true,
      customer: { select: { id: true, fullName: true, additionalInfo: true } },
    },
    orderBy,
  });
};

export const getById = async (id: number) => {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      category: true,
      customer: {
        select: { id: true, fullName: true, phone: true, additionalInfo: true },
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
  address: string;
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
      customer: { select: { id: true, fullName: true, additionalInfo: true } },
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
    address?: string;
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
      customer: { select: { id: true, fullName: true, additionalInfo: true } },
    },
  });
};

export const remove = async (id: number) => {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new Error("Thiết bị không tồn tại");
  return prisma.device.delete({ where: { id } });
};
