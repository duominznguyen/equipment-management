import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, status, sortBy = "createdAt", sortOrder = "asc", technicianId } = query;

  const where: any = {};
  if (technicianId) {
    where.technicianId = Number(technicianId);
  }

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const orConditions: any[] = [
        { workDescription: { contains: term } },
        { technician: { fullName: { contains: term } } },
        { ticket: { title: { contains: term } } },
      ];
      
      const upperTerm = term.toUpperCase();
      if (upperTerm.startsWith('WO') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ id: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('TK') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ ticketId: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('WC') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ maintenanceScheduleId: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('KTV') && !isNaN(Number(upperTerm.slice(3)))) {
        orConditions.push({ technicianId: Number(upperTerm.slice(3)) });
      } else if (!isNaN(Number(term))) {
        orConditions.push({ id: Number(term) });
      }
      return { OR: orConditions };
    });
  }

  if (status && status !== "all") {
    where.status = status;
  }

  const orderBy: any = {};
  if (sortBy === "createdAt" || sortBy === "id") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  return paginate(prisma.workOrder, params, {
    where,
    include: {
      technician: { select: { id: true, fullName: true } },
      ticket: { select: { id: true, title: true } },
      maintenanceSchedule: { select: { id: true, nextMaintenanceDate: true } },
    },
    orderBy,
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
        include: { device: { select: { id: true, name: true, serialNumber: true } } },
      },
      maintenanceSchedule: {
        include: { device: { select: { id: true, name: true, serialNumber: true } } },
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
  // Cho phép tạo Work Order thủ công không cần ticket hoặc lịch bảo trì

  const wo = await prisma.workOrder.create({
    data: { ...data, status: "pending" },
    include: {
      technician: { select: { id: true, fullName: true } },
    },
  });

  if (data.ticketId) {
    await prisma.ticket.update({
      where: { id: data.ticketId },
      data: { status: "processing" },
    });
  }

  return wo;
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

  if (request.status !== "pending") {
    throw new Error("Chỉ có thể chỉnh sửa Work Order ở trạng thái chờ xử lý");
  }

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
  if (status === "pending") {
    data.startedAt = null;
    data.completedAt = null;
  }
  if (status === "processing" || status === "in_progress") {
    data.startedAt = new Date();
    data.completedAt = null;
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

export const completeWorkOrder = async (
  id: number,
  data: {
    reportContent: string;
    parts: { partId: number; quantityUsage: number }[];
  }
) => {
  const request = await prisma.workOrder.findUnique({
    where: { id },
    include: { ticket: true, maintenanceSchedule: true },
  });
  if (!request) throw new Error("Work Order không tồn tại");
  if (request.status === "completed") throw new Error("Work Order đã hoàn thành trước đó");

  return prisma.$transaction(async (tx) => {
    // 1. Update Work Order
    const updatedWO = await tx.workOrder.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
        reportContent: data.reportContent,
      },
    });

    // 2. Add Part Usages (if any)
    if (data.parts && data.parts.length > 0) {
      await tx.partUsage.createMany({
        data: data.parts.map((p) => ({
          workOrderId: id,
          partId: p.partId,
          quantityUsage: p.quantityUsage,
        })),
      });
    }

    // 3. Update related Ticket
    if (request.ticketId) {
      await tx.ticket.update({
        where: { id: request.ticketId },
        data: { status: "resolved" },
      });
      if (request.ticket) {
        await tx.device.update({
          where: { id: request.ticket.deviceId },
          data: { status: "active" },
        });
      }
    }

    // 4. Update related Maintenance Schedule
    if (request.maintenanceScheduleId) {
      await tx.maintenanceSchedule.update({
        where: { id: request.maintenanceScheduleId },
        data: { isHandled: true },
      });
      if (request.maintenanceSchedule) {
        await tx.device.update({
          where: { id: request.maintenanceSchedule.deviceId },
          data: { status: "active" },
        });
      }
    }

    return updatedWO;
  });
};

export const addPartUsage = async (workOrderId: number, partId: number, quantityUsage: number) => {
  const workOrder = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
  if (!workOrder) throw new Error("Work Order không tồn tại");

  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) throw new Error("Linh kiện không tồn tại");

  return prisma.partUsage.create({
    data: { workOrderId, partId, quantityUsage },
  });
};

export const removePartUsage = async (usageId: number) => {
  const usage = await prisma.partUsage.findUnique({ where: { id: usageId } });
  if (!usage) throw new Error("Lịch sử sử dụng linh kiện không tồn tại");

  return prisma.partUsage.delete({ where: { id: usageId } });
};

export const remove = async (id: number) => {
  const request = await prisma.workOrder.findUnique({ where: { id }, include: { partUsages: true } });
  if (!request) throw new Error("Work Order không tồn tại");

  if (request.status !== "pending") {
    throw new Error("Chỉ có thể xoá Work Order ở trạng thái chờ xử lý");
  }

  if (request.partUsages.length > 0) {
    throw new Error("Không thể xoá Work Order đã có sử dụng linh kiện, vui lòng xóa linh kiện trước");
  }

  // Rollback trạng thái Ticket về pending nếu WO này gắn với Ticket
  if (request.ticketId) {
    await prisma.ticket.update({
      where: { id: request.ticketId },
      data: { status: "pending" },
    });
  }

  return prisma.workOrder.delete({ where: { id } });
};
