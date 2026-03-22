import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.maintenanceSchedule, params, {
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });
};

export const getById = async (id: number) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({
    where: { id },
    include: {
      device: true,
      technician: { select: { id: true, fullName: true, phone: true } },
    },
  });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return schedule;
};

export const getMySchedules = async (userId: number, query: any) => {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw new Error("Khách hàng không tồn tại");
  const deviceIds = (
    await prisma.device.findMany({
      where: { customerId: customer.id },
      select: { id: true },
    })
  ).map((d) => d.id);

  const params = getPaginationParams(query);
  return paginate(prisma.maintenanceSchedule, params, {
    where: { deviceId: { in: deviceIds } },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });
};

export const create = async (data: {
  deviceId: number;
  technicianId: number;
  scheduledDate: string;
  description?: string;
}) => {
  return prisma.maintenanceSchedule.create({
    data: {
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      status: "upcoming",
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const update = async (
  id: number,
  data: {
    technicianId?: number;
    scheduledDate?: string;
    description?: string;
  },
) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return prisma.maintenanceSchedule.update({
    where: { id },
    data: {
      ...data,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const updateStatus = async (id: number, status: string) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return prisma.maintenanceSchedule.update({ where: { id }, data: { status } });
};

export const remove = async (id: number) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return prisma.maintenanceSchedule.delete({ where: { id } });
};
