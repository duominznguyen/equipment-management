import bcrypt from 'bcryptjs'
import prisma from '../../config/database.js'
import { generateToken } from '../../utils/jwt.js'

export const login = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      customer: true,
      technician: true,
    }
  })

  if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
  if (!user.isActive) throw new Error('Tài khoản đã bị khoá')

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')

  const token = generateToken({ id: user.id, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.customer || user.technician || null,
    }
  }
}

export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customer: true,
      technician: true,
    }
  })

  if (!user) throw new Error('User không tồn tại')

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.customer || user.technician || null,
  }
}