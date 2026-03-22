import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.ticket, params, {
    include: {
      customer: { select: { id: true, fullName: true, companyName: true } },
      device: { select: { id: true, name: true, serialNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: {
        select: { id: true, fullName: true, phone: true, companyName: true },
      },
      device: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          brand: true,
          model: true,
        },
      },
      maintenanceRequests: {
        include: {
          technician: { select: { id: true, fullName: true } },
        },
      },
    },
  });
  if (!ticket) throw new Error("Ticket không tồn tại");
  return ticket;
};

export const getMyTickets = async (customerId: number, query: any) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: customerId },
  });
  if (!customer) throw new Error("Khách hàng không tồn tại");
  const params = getPaginationParams(query);
  return paginate(prisma.ticket, params, {
    where: { customerId: customer.id },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const create = async (
  userId: number,
  data: {
    deviceId: number;
    title: string;
    description: string;
    priority?: string;
  },
) => {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw new Error("Khách hàng không tồn tại");

  const device = await prisma.device.findUnique({
    where: { id: data.deviceId },
  });
  if (!device) throw new Error("Thiết bị không tồn tại");
  if (device.customerId !== customer.id)
    throw new Error("Thiết bị không thuộc về bạn");

  return prisma.ticket.create({
    data: {
      customerId: customer.id,
      deviceId: data.deviceId,
      title: data.title,
      description: data.description,
      priority: data.priority || "medium",
      status: "pending",
    },
    include: {
      device: { select: { id: true, name: true, serialNumber: true } },
    },
  });
};

export const updateStatus = async (id: number, status: string) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket không tồn tại");
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
};

export const remove = async (id: number) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket không tồn tại");
  return prisma.ticket.delete({ where: { id } });
};
