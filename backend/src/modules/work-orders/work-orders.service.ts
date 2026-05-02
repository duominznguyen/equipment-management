import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.workOrder, params, {
    include: {
      technician: { select: { id: true, fullName: true } },
      ticket: { select: { id: true, title: true } },
      maintenanceSchedule: { select: { id: true, nextMaintenanceDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const request = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      technician: {
        select: { id: true, fullName: true, phone: true },
      },
      ticket: {
        include: { device: { select: { id: true, name: true, serialNumber: true } } }
      },
      maintenanceSchedule: {
        include: { device: { select: { id: true, name: true, serialNumber: true } } }
      },
      partUsages: {
        include: { part: true },
      },
    },
  });
  if (!request) throw new Error("Work Order không tồn tại");
  return request;
};

export const create = async (data: {
  ticketId?: number;
  maintenanceScheduleId?: number;
  technicianId: number;
  workDescription?: string;
}) => {
  if (!data.ticketId && !data.maintenanceScheduleId) {
    throw new Error("Work Order phải thuộc về một Ticket hoặc Lịch bảo trì");
  }

  return prisma.workOrder.create({
    data: { ...data, status: "pending" },
    include: {
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const createFromTicket = async (
  ticketId: number,
  data: {
    technicianId: number;
    workDescription?: string;
  },
) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket không tồn tại");

  const request = await prisma.workOrder.create({
    data: {
      ticketId,
      technicianId: data.technicianId,
      workDescription: data.workDescription,
      status: "pending",
    },
    include: {
      technician: { select: { id: true, fullName: true } },
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "processing" },
  });

  return request;
};

export const update = async (
  id: number,
  data: {
    technicianId?: number;
    workDescription?: string;
  },
) => {
  const request = await prisma.workOrder.findUnique({ where: { id } });
  if (!request) throw new Error("Work Order không tồn tại");
  return prisma.workOrder.update({
    where: { id },
    data,
    include: {
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const updateStatus = async (id: number, status: string) => {
  const request = await prisma.workOrder.findUnique({
    where: { id },
    include: { ticket: true, maintenanceSchedule: true },
  });
  if (!request) throw new Error("Work Order không tồn tại");

  const data: any = { status };
  if (status === "processing" || status === "in_progress") {
    data.startedAt = new Date();
  }
  if (status === "completed") {
    data.completedAt = new Date();
    
    // Cập nhật trạng thái Ticket nếu WorkOrder được tạo từ Ticket
    if (request.ticketId) {
      await prisma.ticket.update({
        where: { id: request.ticketId },
        data: { status: "resolved" },
      });
      if (request.ticket) {
         await prisma.device.update({ where: { id: request.ticket.deviceId }, data: { status: "active" } });
      }
    }
    
    // Cập nhật trạng thái Lịch bảo trì nếu WorkOrder được tạo từ Schedule
    if (request.maintenanceScheduleId) {
      await prisma.maintenanceSchedule.update({
        where: { id: request.maintenanceScheduleId },
        data: { isHandled: true },
      });
      if (request.maintenanceSchedule) {
         await prisma.device.update({ where: { id: request.maintenanceSchedule.deviceId }, data: { status: "active" } });
      }
    }
  }

  return prisma.workOrder.update({ where: { id }, data });
};

// Quản lý Linh kiện sử dụng (PartUsage)
export const addPartUsage = async (workOrderId: number, partId: number, quantityUsage: number) => {
  const workOrder = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
  if (!workOrder) throw new Error("Work Order không tồn tại");

  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) throw new Error("Linh kiện không tồn tại");
  if (part.stockQuantity < quantityUsage) throw new Error("Số lượng tồn kho không đủ");

  return prisma.$transaction(async (tx) => {
    const usage = await tx.partUsage.create({
      data: { workOrderId, partId, quantityUsage }
    });

    await tx.part.update({
      where: { id: partId },
      data: { stockQuantity: { decrement: quantityUsage } }
    });

    return usage;
  });
};

export const removePartUsage = async (usageId: number) => {
  const usage = await prisma.partUsage.findUnique({ where: { id: usageId } });
  if (!usage) throw new Error("Lịch sử sử dụng linh kiện không tồn tại");

  return prisma.$transaction(async (tx) => {
    await tx.partUsage.delete({ where: { id: usageId } });
    await tx.part.update({
      where: { id: usage.partId },
      data: { stockQuantity: { increment: usage.quantityUsage } }
    });
  });
};

export const remove = async (id: number) => {
  const request = await prisma.workOrder.findUnique({ where: { id }, include: { partUsages: true } });
  if (!request) throw new Error("Work Order không tồn tại");
  
  if (request.partUsages.length > 0) {
     throw new Error("Không thể xoá Work Order đã có sử dụng linh kiện, vui lòng xóa linh kiện trước");
  }

  return prisma.workOrder.delete({ where: { id } });
};
