import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.maintenanceRequest, params, {
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
      ticket: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      device: true,
      technician: {
        select: { id: true, fullName: true, phone: true, specialization: true },
      },
      ticket: true,
      partExports: {
        include: {
          details: { include: { part: true } },
        },
      },
    },
  });
  if (!request) throw new Error("Phiếu bảo trì không tồn tại");
  return request;
};

export const create = async (data: {
  ticketId?: number;
  deviceId: number;
  technicianId: number;
  description: string;
  type: string;
}) => {
  return prisma.maintenanceRequest.create({
    data: { ...data, status: "pending" },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const createFromTicket = async (
  ticketId: number,
  data: {
    technicianId: number;
    description: string;
  },
) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket không tồn tại");

  const request = await prisma.maintenanceRequest.create({
    data: {
      ticketId,
      deviceId: ticket.deviceId,
      technicianId: data.technicianId,
      description: data.description,
      type: "repair",
      status: "pending",
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
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
    description?: string;
  },
) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Phiếu bảo trì không tồn tại");
  return prisma.maintenanceRequest.update({
    where: { id },
    data,
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
      technician: { select: { id: true, fullName: true } },
    },
  });
};

export const updateStatus = async (id: number, status: string) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { ticket: true },
  });
  if (!request) throw new Error("Phiếu bảo trì không tồn tại");

  const data: any = { status };
  if (status === "processing") data.startedAt = new Date();
  if (status === "completed") {
    data.completedAt = new Date();
    await prisma.device.update({
      where: { id: request.deviceId },
      data: { status: "active" },
    });
    if (request.ticketId) {
      await prisma.ticket.update({
        where: { id: request.ticketId },
        data: { status: "resolved" },
      });
    }
  }

  return prisma.maintenanceRequest.update({ where: { id }, data });
};
