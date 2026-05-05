import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.partExport, params, {
    include: {
      technician: { select: { id: true, fullName: true, user: { select: { username: true } } } },
      workOrder: { select: { id: true, workDescription: true } },
      details: { include: { part: true } },
    },
    orderBy: { exportDate: "desc" },
  });
};

export const getById = async (id: number) => {
  const partExport = await prisma.partExport.findUnique({
    where: { id },
    include: {
      technician: { select: { id: true, fullName: true, user: { select: { username: true } } } },
      workOrder: true,
      details: { include: { part: true } },
    },
  });
  if (!partExport) throw new Error("Phiếu xuất không tồn tại");
  return partExport;
};

export const create = async (
  userId: number,
  data: {
    workOrderId?: number;
    exportDate?: string;
    reason?: string;
    details: { partId: number; quantity: number }[];
  },
) => {
  const technician = await prisma.technician.findUnique({ where: { userId } });
  if (!technician) throw new Error("Không tìm thấy thông tin Kỹ thuật viên cho user này");

  // Kiểm tra tồn kho trước khi xuất
  for (const detail of data.details) {
    const part = await prisma.part.findUnique({ where: { id: detail.partId } });
    if (!part) throw new Error(`Linh kiện ID ${detail.partId} không tồn tại`);
    if (part.stockQuantity < detail.quantity) {
      throw new Error(`Linh kiện "${part.name}" không đủ tồn kho (còn ${part.stockQuantity})`);
    }
  }

  return prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu xuất và chi tiết
    const partExport = await tx.partExport.create({
      data: {
        technicianId: technician.id,
        workOrderId: data.workOrderId,
        exportDate: data.exportDate ? new Date(data.exportDate) : new Date(),
        reason: data.reason,
        status: "completed", 
        details: {
          create: data.details.map((d) => ({
            partId: d.partId,
            quantity: d.quantity,
          })),
        },
      },
      include: {
        technician: { select: { id: true, fullName: true } },
        workOrder: { select: { id: true, workDescription: true } },
        details: { include: { part: true } },
      },
    });

    // 2. Cập nhật tồn kho (Stock quantity)
    for (const detail of data.details) {
      await tx.part.update({
        where: { id: detail.partId },
        data: { stockQuantity: { decrement: detail.quantity } },
      });
    }

    return partExport;
  });
};

export const updateStatus = async (id: number, status: string) => {
  const partExport = await prisma.partExport.findUnique({ where: { id } });
  if (!partExport) throw new Error("Phiếu xuất không tồn tại");

  return prisma.partExport.update({
    where: { id },
    data: { status },
  });
};
