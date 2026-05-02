import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.warrantyContract, params, {
    include: {
      device: { 
        select: { 
          id: true, 
          name: true, 
          serialNumber: true,
          customer: { select: { id: true, fullName: true, additionalInfo: true } }
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const contract = await prisma.warrantyContract.findUnique({
    where: { id },
    include: {
      device: {
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true, additionalInfo: true },
          }
        }
      },
    },
  });
  if (!contract) throw new Error("Hợp đồng không tồn tại");
  return contract;
};

export const getByCustomer = async (customerId: number, query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.warrantyContract, params, {
    where: { device: { customerId } },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const create = async (data: {
  deviceId: number;
  contractNumber: string;
  startDate: string;
  endDate: string;
  terms?: string;
}) => {
  const existing = await prisma.warrantyContract.findUnique({
    where: { contractNumber: data.contractNumber },
  });
  if (existing) throw new Error("Mã hợp đồng đã tồn tại");

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const now = new Date();
  const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const status =
    endDate < now ? "expired" : diffDays <= 30 ? "expiring_soon" : "active";

  return prisma.warrantyContract.create({
    data: { 
      deviceId: data.deviceId,
      contractNumber: data.contractNumber,
      terms: data.terms,
      startDate, 
      endDate, 
      status 
    },
    include: {
      device: { 
        select: { 
          id: true, 
          name: true, 
          serialNumber: true,
          customer: { select: { id: true, fullName: true, additionalInfo: true } }
        } 
      },
    },
  });
};

export const update = async (
  id: number,
  data: {
    startDate?: string;
    endDate?: string;
    terms?: string;
  },
) => {
  const contract = await prisma.warrantyContract.findUnique({ where: { id } });
  if (!contract) throw new Error("Hợp đồng không tồn tại");

  const endDate = data.endDate ? new Date(data.endDate) : contract.endDate;
  const now = new Date();
  const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const status =
    endDate < now ? "expired" : diffDays <= 30 ? "expiring_soon" : "active";

  return prisma.warrantyContract.update({
    where: { id },
    data: {
      terms: data.terms,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status,
    },
    include: {
      device: { 
        select: { 
          id: true, 
          name: true, 
          serialNumber: true,
          customer: { select: { id: true, fullName: true, additionalInfo: true } }
        } 
      },
    },
  });
};

export const remove = async (id: number) => {
  const contract = await prisma.warrantyContract.findUnique({ where: { id } });
  if (!contract) throw new Error("Hợp đồng không tồn tại");
  return prisma.warrantyContract.delete({ where: { id } });
};
