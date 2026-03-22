import bcrypt from "bcryptjs";
import prisma from "../../config/database.js";
import { getPaginationParams, paginate } from "../../utils/pagination.js";

export const getAll = async (query: any) => {
  const params = getPaginationParams(query);
  return paginate(prisma.user, params, {
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      customer: { select: { fullName: true, phone: true } },
      technician: { select: { fullName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      customer: true,
      technician: true,
    },
  });
  if (!user) throw new Error("User không tồn tại");
  return user;
};

export const create = async (data: {
  username: string;
  password: string;
  email: string;
  role: string;
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
  return prisma.user.create({
    data: {
      username: data.username,
      passwordHash,
      email: data.email,
      role: data.role,
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const update = async (
  id: number,
  data: { email?: string; role?: string },
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User không tồn tại");
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const toggleActive = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User không tồn tại");
  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, username: true, isActive: true },
  });
};
