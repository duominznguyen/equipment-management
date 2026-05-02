import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.maintenanceSchedule, params, {
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
    orderBy: { nextMaintenanceDate: "asc" },
  });
};

export const getById = async (id: number) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({
    where: { id },
    include: {
      device: true,
      workOrders: true,
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
    },
    orderBy: { nextMaintenanceDate: "asc" },
  });
};

export const create = async (data: {
  deviceId: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  leadTimeDays?: number;
  isHandled?: boolean;
  isContinueMaintain?: boolean;
}) => {
  return prisma.maintenanceSchedule.create({
    data: {
      deviceId: data.deviceId,
      lastMaintenanceDate: data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined,
      leadTimeDays: data.leadTimeDays,
      isHandled: data.isHandled,
      isContinueMaintain: data.isContinueMaintain,
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
  });
};

export const update = async (
  id: number,
  data: {
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    leadTimeDays?: number;
    isHandled?: boolean;
    isContinueMaintain?: boolean;
  },
) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return prisma.maintenanceSchedule.update({
    where: { id },
    data: {
      lastMaintenanceDate: data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined,
      leadTimeDays: data.leadTimeDays,
      isHandled: data.isHandled,
      isContinueMaintain: data.isContinueMaintain,
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
  });
};

export const updateStatus = async (id: number, isHandled: boolean) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  return prisma.maintenanceSchedule.update({ where: { id }, data: { isHandled } });
};

export const remove = async (id: number) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");
  
  const workOrderCount = await prisma.workOrder.count({ where: { maintenanceScheduleId: id } });
  if (workOrderCount > 0) throw new Error("Không thể xoá lịch bảo trì vì đã có Work Order liên quan");
  
  return prisma.maintenanceSchedule.delete({ where: { id } });
};
