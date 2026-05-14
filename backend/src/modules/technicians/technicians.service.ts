import bcrypt from "bcryptjs";
import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  const { search, sortBy, sortOrder, isActive, startDate, endDate, skillId } = query;

  const where: any = {};

  if (search) {
    const searchTerms = search.trim().split(/\s+/);
    where.AND = searchTerms.map((term: string) => {
      const parsedId = parseInt(term.replace(/^KTV/i, ""), 10);
      const orConditions: any[] = [
        { fullName: { contains: term } },
        { phone: { contains: term } },
        { user: { username: { contains: term } } },
        { user: { email: { contains: term } } },
      ];
      if (!isNaN(parsedId)) {
        orConditions.push({ id: parsedId });
      }
      return { OR: orConditions };
    });
  }

  if (isActive !== undefined && isActive !== "") {
    if (!where.user) where.user = {};
    where.user.isActive = isActive === "true";
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (query.skillIds && query.skillIds !== "all") {
    const ids = query.skillIds.split(",").map(Number).filter((id: number) => !isNaN(id));
    if (ids.length > 0) {
      where.technicianSkills = {
        some: {
          deviceCategoryId: { in: ids },
        },
      };
    }
  } else if (skillId && skillId !== "all") {
    // Keep backward compatibility if needed
    where.technicianSkills = {
      some: {
        deviceCategoryId: Number(skillId),
      },
    };
  }

  const orderBy: any = {};
  if (sortBy === "username" || sortBy === "email") {
    orderBy.user = { [sortBy]: sortOrder || "asc" };
  } else if (sortBy === "fullName" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder || "asc";
  } else {
    orderBy.createdAt = "desc";
  }

  return paginate(prisma.technician, params, {
    where,
    include: {
      user: {
        select: { id: true, username: true, email: true, isActive: true, lockReason: true },
      },
      technicianSkills: {
        include: { deviceCategory: true },
      },
    },
    orderBy,
  });
};

export const getById = async (id: number) => {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, username: true, email: true, isActive: true, lockReason: true },
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
          select: { id: true, username: true, email: true, isActive: true, lockReason: true },
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
        select: { id: true, username: true, email: true, isActive: true, lockReason: true },
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

export const toggleLock = async (id: number, isActive: boolean, lockReason?: string) => {
  const technician = await prisma.technician.findUnique({ where: { id } });
  if (!technician) throw new Error("Kỹ thuật viên không tồn tại");
  
  return prisma.user.update({
    where: { id: technician.userId },
    data: {
      isActive,
      lockReason: isActive ? null : lockReason,
    },
  });
};
