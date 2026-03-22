import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.deviceCategory, params, {
    orderBy: { id: "asc" },
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
  return prisma.deviceCategory.delete({ where: { id } });
};
