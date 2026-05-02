import bcrypt from "bcryptjs";
import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.technician, params, {
    include: {
      user: {
        select: { id: true, username: true, email: true, isActive: true },
      },
      technicianSkills: {
        include: { deviceCategory: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, username: true, email: true, isActive: true },
      },
      technicianSkills: {
        include: { deviceCategory: true },
      },
    },
  });
  if (!technician) throw new Error("Kỹ thuật viên không tồn tại");
  return technician;
};

export const create = async (data: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  deviceCategoryIds?: number[];
}) => {
  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUsername) throw new Error("Username đã tồn tại");

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail) throw new Error("Email đã tồn tại");

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: data.username,
        passwordHash,
        email: data.email,
        role: "technician",
        isActive: true,
      },
    });
    return tx.technician.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        technicianSkills: data.deviceCategoryIds
          ? {
              create: data.deviceCategoryIds.map((id) => ({
                deviceCategoryId: id,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, isActive: true },
        },
        technicianSkills: {
          include: { deviceCategory: true },
        },
      },
    });
  });
};

export const update = async (
  id: number,
  data: {
    fullName?: string;
    phone?: string;
    deviceCategoryIds?: number[];
  },
) => {
  const technician = await prisma.technician.findUnique({ where: { id } });
  if (!technician) throw new Error("Kỹ thuật viên không tồn tại");
  return prisma.technician.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      technicianSkills: data.deviceCategoryIds
        ? {
            deleteMany: {},
            create: data.deviceCategoryIds.map((id) => ({
              deviceCategoryId: id,
            })),
          }
        : undefined,
    },
    include: {
      user: {
        select: { id: true, username: true, email: true, isActive: true },
      },
      technicianSkills: {
        include: { deviceCategory: true },
      },
    },
  });
};

export const remove = async (id: number) => {
  const technician = await prisma.technician.findUnique({ where: { id } });
  if (!technician) throw new Error("Kỹ thuật viên không tồn tại");
  return prisma.$transaction(async (tx) => {
    await tx.technicianSkill.deleteMany({ where: { technicianId: id } });
    await tx.technician.delete({ where: { id } });
    await tx.user.delete({ where: { id: technician.userId } });
  });
};
