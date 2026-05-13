import prisma from '../../config/database.js'
import { getPaginationParams, paginate } from '../../utils/pagination.js'

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, startDate, endDate, sortBy, sortOrder } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const isNumeric = !isNaN(Number(term));
      const orConditions: any[] = [
        { supplier: { contains: term } },
        { note: { contains: term } },
      ];
      if (isNumeric) {
        orConditions.push({ id: Number(term) });
      }
      return { OR: orConditions };
    });
  }

  if (startDate || endDate) {
    where.importDate = {};
    if (startDate) where.importDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.importDate.lte = end;
    }
  }

  const orderBy: any = {};
  if (sortBy === "importDate" || sortBy === "totalCost" || sortBy === "id") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.importDate = "desc";
  }

  return paginate(prisma.partImport, params, {
    where,
    include: {
      user: { select: { id: true, username: true } },
      details: { include: { part: true } }
    },
    orderBy
  });
};

export const getById = async (id: number) => {
  const partImport = await prisma.partImport.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      details: { include: { part: true } }
    }
  })
  if (!partImport) throw new Error('Phiếu nhập không tồn tại')
  return partImport
}

export const create = async (userId: number, data: {
  supplier: string
  importDate: string; note?: string
  details: { partId: number; quantity: number; unitPrice: number }[]
}) => {
  if (!data.details || data.details.length === 0) throw new Error("Phải có ít nhất một linh kiện");
  for (const detail of data.details) {
    if (detail.quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");
    if (detail.unitPrice < 0) throw new Error("Đơn giá không được âm");
  }

  const totalCost = data.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0)

  return prisma.$transaction(async (tx) => {
    const partImport = await tx.partImport.create({
      data: {
        importedBy: userId,
        supplier: data.supplier,
        importDate: new Date(data.importDate),
        totalCost,
        note: data.note,
        details: {
          create: data.details.map(d => ({
            partId: d.partId,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
          }))
        }
      },
      include: {
        user: { select: { id: true, username: true } },
        details: { include: { part: true } }
      }
    })

    // Cập nhật tồn kho
    for (const detail of data.details) {
      await tx.part.update({
        where: { id: detail.partId },
        data: { stockQuantity: { increment: detail.quantity } }
      })
    }

    return partImport
  })
}

export const update = async (id: number, data: { supplier?: string; note?: string }) => {
  const partImport = await prisma.partImport.findUnique({ where: { id } });
  if (!partImport) throw new Error('Phiếu nhập không tồn tại');

  return prisma.partImport.update({
    where: { id },
    data: {
      supplier: data.supplier,
      note: data.note,
    }
  });
};

export const remove = async (id: number) => {
  const partImport = await prisma.partImport.findUnique({
    where: { id },
    include: { details: true }
  });
  if (!partImport) throw new Error('Phiếu nhập không tồn tại');

  return prisma.$transaction(async (tx) => {
    // Kiểm tra tồn kho trước khi xóa
    for (const detail of partImport.details) {
      const part = await tx.part.findUnique({ where: { id: detail.partId } });
      if (!part) throw new Error(`Linh kiện ID ${detail.partId} không tồn tại`);
      if (part.stockQuantity < detail.quantity) {
        throw new Error(`Không thể xóa: Số lượng tồn kho hiện tại của linh kiện "${part.name}" (${part.stockQuantity}) nhỏ hơn số lượng nhập (${detail.quantity}).`);
      }
    }

    // Giảm tồn kho
    for (const detail of partImport.details) {
      await tx.part.update({
        where: { id: detail.partId },
        data: { stockQuantity: { decrement: detail.quantity } }
      });
    }

    // Xóa chi tiết và phiếu nhập
    await tx.partImportDetail.deleteMany({ where: { importId: id } });
    return tx.partImport.delete({ where: { id } });
  });
};