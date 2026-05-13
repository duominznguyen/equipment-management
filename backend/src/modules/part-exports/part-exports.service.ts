import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, startDate, endDate, status, creatorRole, sortBy, sortOrder } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const upperTerm = term.toUpperCase();
      const orConditions: any[] = [
        { reason: { contains: term } },
        { technician: { fullName: { contains: term } } },
        { user: { username: { contains: term } } },
      ];
      
      // Parse PX0001 for ID
      if (upperTerm.startsWith('PX') && !isNaN(Number(upperTerm.slice(2)))) {
        orConditions.push({ id: Number(upperTerm.slice(2)) });
      } else if (upperTerm.startsWith('TECH') && !isNaN(Number(upperTerm.slice(4)))) {
        orConditions.push({ technicianId: Number(upperTerm.slice(4)) });
      } else if (upperTerm.startsWith('ADMIN') && !isNaN(Number(upperTerm.slice(5)))) {
        orConditions.push({ userId: Number(upperTerm.slice(5)) });
      } else if (!isNaN(Number(term))) {
        orConditions.push({ id: Number(term) });
      }
      return { OR: orConditions };
    });
  }

  if (startDate || endDate) {
    where.exportDate = {};
    if (startDate) where.exportDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.exportDate.lte = end;
    }
  }

  if (status) {
    where.status = status;
  }

  if (creatorRole === 'admin') {
    where.technicianId = null;
  } else if (creatorRole === 'technician') {
    where.technicianId = { not: null };
  }

  const orderBy: any = {};
  if (sortBy === "exportDate" || sortBy === "id" || sortBy === "status") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.exportDate = "desc";
  }

  return paginate(prisma.partExport, params, {
    where,
    include: {
      technician: { select: { id: true, fullName: true, user: { select: { username: true } } } },
      user: { select: { id: true, username: true } },
      details: { include: { part: true } },
    },
    orderBy,
  });
};

export const getById = async (id: number) => {
  const partExport = await prisma.partExport.findUnique({
    where: { id },
    include: {
      technician: { select: { id: true, fullName: true, user: { select: { username: true } } } },
      user: { select: { id: true, username: true } },
      details: { include: { part: true } },
    },
  });
  if (!partExport) throw new Error("Phiếu xuất không tồn tại");
  return partExport;
};

export const create = async (
  user: { id: number, role: string },
  data: {
    exportDate?: string;
    reason?: string;
    details: { partId: number; quantity: number }[];
  },
) => {
  let technicianId: number | undefined;
  let status = "pending";

  if (user.role === "technician") {
    const technician = await prisma.technician.findUnique({ where: { userId: user.id } });
    if (!technician) throw new Error("Không tìm thấy thông tin Kỹ thuật viên cho user này");
    technicianId = technician.id;
  } else if (user.role === "admin") {
    status = "completed"; // Admin xuất trực tiếp thì complete luôn
  }

  if (!data.details || data.details.length === 0) throw new Error("Phải có ít nhất một linh kiện");
  // Kiểm tra tồn kho và số lượng trước
  for (const detail of data.details) {
    if (detail.quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");
    const part = await prisma.part.findUnique({ where: { id: detail.partId } });
    if (!part) throw new Error(`Linh kiện ID ${detail.partId} không tồn tại`);
    if (part.stockQuantity < detail.quantity) {
      throw new Error(`Linh kiện "${part.name}" không đủ tồn kho (còn ${part.stockQuantity})`);
    }
  }

  return prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu xuất
    const partExport = await tx.partExport.create({
      data: {
        technicianId,
        userId: user.id, // Lưu ID của người tạo (admin hoặc technician)
        exportDate: data.exportDate ? new Date(data.exportDate) : new Date(),
        reason: data.reason,
        status,
        details: {
          create: data.details.map((d) => ({
            partId: d.partId,
            quantity: d.quantity,
          })),
        },
      },
      include: {
        technician: { select: { id: true, fullName: true } },
        user: { select: { username: true } },
        details: { include: { part: true } },
      },
    });

    // 2. Chỉ trừ tồn kho nếu status = "completed"
    if (status === "completed") {
      for (const detail of data.details) {
        await tx.part.update({
          where: { id: detail.partId },
          data: { stockQuantity: { decrement: detail.quantity } },
        });
      }
    }

    return partExport;
  });
};

export const updateStatus = async (id: number, status: string, rejectReason?: string) => {
  const partExport = await prisma.partExport.findUnique({ 
    where: { id },
    include: { details: true }
  });
  if (!partExport) throw new Error("Phiếu xuất không tồn tại");
  if (partExport.status !== "pending") {
    throw new Error("Chỉ có thể duyệt phiếu đang ở trạng thái chờ");
  }

  return prisma.$transaction(async (tx) => {
    if (status === "completed" || status === "approved") {
      // Kiểm tra tồn kho trước khi duyệt
      for (const detail of partExport.details) {
        const part = await tx.part.findUnique({ where: { id: detail.partId } });
        if (!part) throw new Error(`Linh kiện ID ${detail.partId} không tồn tại`);
        if (part.stockQuantity < detail.quantity) {
          throw new Error(`Linh kiện "${part.name}" không đủ tồn kho để duyệt phiếu này (còn ${part.stockQuantity})`);
        }
      }

      // Trừ tồn kho
      for (const detail of partExport.details) {
        await tx.part.update({
          where: { id: detail.partId },
          data: { stockQuantity: { decrement: detail.quantity } },
        });
      }
      status = "completed"; // chuẩn hóa status
    }

    let updatedReason = partExport.reason;
    if (status === "cancelled" && rejectReason) {
      updatedReason = updatedReason ? `${updatedReason} | Từ chối vì: ${rejectReason}` : `Từ chối vì: ${rejectReason}`;
    }

    return tx.partExport.update({
      where: { id },
      data: { status, reason: updatedReason },
    });
  });
};

export const update = async (id: number, data: { reason?: string }) => {
  const partExport = await prisma.partExport.findUnique({ where: { id } });
  if (!partExport) throw new Error('Phiếu xuất không tồn tại');

  return prisma.partExport.update({
    where: { id },
    data: { reason: data.reason }
  });
};

export const remove = async (id: number) => {
  const partExport = await prisma.partExport.findUnique({
    where: { id },
    include: { details: true }
  });
  if (!partExport) throw new Error('Phiếu xuất không tồn tại');

  return prisma.$transaction(async (tx) => {
    // Nếu phiếu đã được duyệt/hoàn thành, phải cộng lại tồn kho trước khi xóa
    if (partExport.status === "completed" || partExport.status === "approved") {
      for (const detail of partExport.details) {
        await tx.part.update({
          where: { id: detail.partId },
          data: { stockQuantity: { increment: detail.quantity } }
        });
      }
    }

    // Xóa chi tiết và phiếu xuất
    await tx.partExportDetail.deleteMany({ where: { exportId: id } });
    return tx.partExport.delete({ where: { id } });
  });
};
