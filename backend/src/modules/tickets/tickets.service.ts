import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, startDate, endDate, status, sortBy, sortOrder } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const upperTerm = term.toUpperCase();
      const orConditions: any[] = [
        { title: { contains: term } },
        { description: { contains: term } },
        { device: { name: { contains: term } } },
        { device: { customer: { fullName: { contains: term } } } },
      ];
      
      if (upperTerm.startsWith('TK') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ id: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('TB') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ deviceId: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('KH') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ device: { customerId: Number(upperTerm.slice(2)) } });
      } else if (!isNaN(Number(term))) {
        orConditions.push({ id: Number(term) });
      }
      return { OR: orConditions };
    });
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (status) {
    where.status = status;
  }

  if (sortBy === "priority") {
    // Custom sort for priority: high -> medium -> low
    const priorityWeight: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    // Fetch all matching records' IDs and priorities
    const allMatching = await prisma.ticket.findMany({
      where,
      select: { id: true, priority: true }
    });

    allMatching.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightA === weightB) return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
      return sortOrder === "asc" ? weightA - weightB : weightB - weightA;
    });

    const total = allMatching.length;
    const skip = (params.page - 1) * params.pageSize;
    const paginatedIds = allMatching.slice(skip, skip + params.pageSize).map(t => t.id);

    const data = await prisma.ticket.findMany({
      where: { id: { in: paginatedIds } },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            customer: { select: { id: true, fullName: true, additionalInfo: true } },
          },
        },
      },
    });

    // findMany with 'in' doesn't guarantee order, so we sort it again
    data.sort((a, b) => paginatedIds.indexOf(a.id) - paginatedIds.indexOf(b.id));

    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize)
    };
  }

  const orderBy: any = {};
  if (sortBy === "createdAt" || sortBy === "id" || sortBy === "status") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  return paginate(prisma.ticket, params, {
    where,
    include: {
      device: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          customer: { select: { id: true, fullName: true, additionalInfo: true } },
        },
      },
    },
    orderBy,
  });
};

export const getById = async (id: number) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      device: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          brand: true,
          model: true,
          customer: { select: { id: true, fullName: true, phone: true, additionalInfo: true } },
        },
      },
      workOrders: {
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
    where: { device: { customerId: customer.id } },
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

export const updateStatus = async (id: number, status: string, rejectionReason?: string) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket không tồn tại");
  return prisma.ticket.update({
    where: { id },
    data: { 
      status,
      ...(status === 'rejected' && rejectionReason ? { rejectionReason } : {})
    },
  });
};

export const remove = async (id: number) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket không tồn tại");
  
  const workOrderCount = await prisma.workOrder.count({ where: { ticketId: id } });
  if (workOrderCount > 0) throw new Error("Không thể xoá ticket vì đã có Work Order đang xử lý");
  
  return prisma.ticket.delete({ where: { id } });
};
