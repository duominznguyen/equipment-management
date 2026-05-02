import prisma from '../../config/database.js'
import { getPaginationParams, paginate } from '../../utils/pagination.js'

export const getAll = async (query: any) => {
  const params = getPaginationParams(query)
  return paginate(prisma.part, params, {
    orderBy: { name: 'asc' }
  })
}

export const getById = async (id: number) => {
  const part = await prisma.part.findUnique({ where: { id } })
  if (!part) throw new Error('Linh kiện không tồn tại')
  return part
}

export const create = async (data: {
  name: string; code: string; unit: string
  stockQuantity?: number; minQuantity?: number; description?: string
}) => {
  const existing = await prisma.part.findUnique({ where: { code: data.code } })
  if (existing) throw new Error('Mã linh kiện đã tồn tại')
  return prisma.part.create({ data })
}

export const update = async (id: number, data: {
  name?: string; unit?: string
  minQuantity?: number; description?: string
}) => {
  const part = await prisma.part.findUnique({ where: { id } })
  if (!part) throw new Error('Linh kiện không tồn tại')
  return prisma.part.update({ where: { id }, data })
}

export const remove = async (id: number) => {
  const part = await prisma.part.findUnique({ where: { id } })
  if (!part) throw new Error('Linh kiện không tồn tại')

  const usagesCount = await prisma.partUsage.count({ where: { partId: id } })
  if (usagesCount > 0) throw new Error('Không thể xoá linh kiện vì đã có lịch sử sử dụng trong Work Order')

  const importsCount = await prisma.partImportDetail.count({ where: { partId: id } })
  if (importsCount > 0) throw new Error('Không thể xoá linh kiện vì đã có lịch sử nhập kho')

  return prisma.part.delete({ where: { id } })
}