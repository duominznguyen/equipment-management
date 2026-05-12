import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, sortBy, sortOrder } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => ({
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
      ],
    }));
  }

  const orderBy: any = {};
  if (sortBy === "name" || sortBy === "id") {
    orderBy[sortBy] = sortOrder || "desc";
  } else {
    orderBy.id = "asc";
  }

  return paginate(prisma.deviceCategory, params, {
    where,
    orderBy,
  });
};

export const getById = async (id: number) => {
  const category = await prisma.deviceCategory.findUnique({ where: { id } });
  if (!category) throw new Error("Loại thiết bị không tồn tại");
  return category;
};

export const create = async (data: { name: string; description?: string }) => {
  return prisma.deviceCategory.create({ data });
};

export const update = async (
  id: number,
  data: { name?: string; description?: string },
) => {
  const category = await prisma.deviceCategory.findUnique({ where: { id } });
  if (!category) throw new Error("Loại thiết bị không tồn tại");
  return prisma.deviceCategory.update({ where: { id }, data });
};

export const remove = async (id: number) => {
  const category = await prisma.deviceCategory.findUnique({ where: { id } });
  if (!category) throw new Error("Loại thiết bị không tồn tại");

  const deviceCount = await prisma.device.count({ where: { categoryId: id } });
  if (deviceCount > 0)
    throw new Error("Không thể xoá loại thiết bị đang có thiết bị");

  const skillCount = await prisma.technicianSkill.count({ where: { deviceCategoryId: id } });
  if (skillCount > 0)
    throw new Error("Không thể xoá loại thiết bị vì đang có kỹ thuật viên phụ trách");

  return prisma.deviceCategory.delete({ where: { id } });
};
