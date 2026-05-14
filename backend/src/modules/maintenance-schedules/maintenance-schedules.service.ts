import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, status, sortBy = "nextMaintenanceDate", order = "asc" } = query;

  const where: any = {};

  if (search) {
    where.device = {
      OR: [
        { name: { contains: search } },
        { serialNumber: { contains: search } },
      ],
    };
  }

  if (status === "handled") {
    where.isHandled = true;
  } else if (status === "unhandled") {
    where.isHandled = false;
  } else if (status === "due") {
    where.isHandled = false;
    where.isContinueMaintain = true;
    where.nextMaintenanceDate = { lte: new Date(new Date().setHours(0, 0, 0, 0)) };
  } else if (status === "upcoming") {
    where.isHandled = false;
    where.isContinueMaintain = true;
    where.nextMaintenanceDate = { gt: new Date(new Date().setHours(0, 0, 0, 0)) };
  }

  const orderBy = { [sortBy]: order };

  return paginate(prisma.maintenanceSchedule, params, {
    where,
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      _count: { select: { workOrders: true } },
    },
    orderBy,
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
  const { search, status, sortBy = "nextMaintenanceDate", order = "asc" } = query;

  const where: any = { deviceId: { in: deviceIds } };

  if (search) {
    where.device = {
      OR: [
        { name: { contains: search } },
        { serialNumber: { contains: search } },
      ],
    };
  }

  if (status === "handled") {
    where.isHandled = true;
  } else if (status === "unhandled") {
    where.isHandled = false;
  } else if (status === "due") {
    where.isHandled = false;
    where.isContinueMaintain = true;
    where.nextMaintenanceDate = { lte: new Date(new Date().setHours(0, 0, 0, 0)) };
  } else if (status === "upcoming") {
    where.isHandled = false;
    where.isContinueMaintain = true;
    where.nextMaintenanceDate = { gt: new Date(new Date().setHours(0, 0, 0, 0)) };
  }

  const orderBy = { [sortBy]: order };

  return paginate(prisma.maintenanceSchedule, params, {
    where,
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      _count: { select: { workOrders: true } },
    },
    orderBy,
  });
};

export const create = async (data: {
  deviceId: number;
  lastMaintenanceDate?: string;
  maintenanceIntervalDays?: number;
  leadTimeDays?: number;
  isHandled?: boolean;
  isContinueMaintain?: boolean;
}) => {
  const lastDate = data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : new Date();
  const interval = data.maintenanceIntervalDays ?? 30;

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + interval);

  return prisma.maintenanceSchedule.create({
    data: {
      deviceId: data.deviceId,
      lastMaintenanceDate: lastDate,
      nextMaintenanceDate: nextDate,
      maintenanceIntervalDays: interval,
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
    maintenanceIntervalDays?: number;
    leadTimeDays?: number;
    isHandled?: boolean;
    isContinueMaintain?: boolean;
  },
) => {
  const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) throw new Error("Lịch bảo trì không tồn tại");

  const lastDate = data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : schedule.lastMaintenanceDate;
  const interval = data.maintenanceIntervalDays ?? schedule.maintenanceIntervalDays;

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + interval);

  return prisma.maintenanceSchedule.update({
    where: { id },
    data: {
      lastMaintenanceDate: lastDate,
      nextMaintenanceDate: nextDate,
      maintenanceIntervalDays: interval,
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
