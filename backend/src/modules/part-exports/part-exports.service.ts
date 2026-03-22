import prisma from '../../config/database.js'
import { getPaginationParams, paginate } from '../../utils/pagination.js'

export const getAll = async (query: any) => {
  const params = getPaginationParams(query)
  return paginate(prisma.partExport, params, {
    include: {
      user: { select: { id: true, username: true } },
      maintenanceRequest: { select: { id: true, description: true } },
      details: { include: { part: true } }
    },
    orderBy: { exportDate: 'desc' }
  })
}

export const getById = async (id: number) => {
  const partExport = await prisma.partExport.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      maintenanceRequest: true,
      details: { include: { part: true } }
    }
  })
  if (!partExport) throw new Error('Phiếu xuất không tồn tại')
  return partExport
}

export const create = async (userId: number, data: {
  exportCode: string; maintenanceRequestId: number
  exportDate: string; note?: string
  details: { partId: number; quantity: number; unitPrice: number }[]
}) => {
  const existing = await prisma.partExport.findUnique({ where: { exportCode: data.exportCode } })
  if (existing) throw new Error('Mã phiếu xuất đã tồn tại')

  // Kiểm tra tồn kho
  for (const detail of data.details) {
    const part = await prisma.part.findUnique({ where: { id: detail.partId } })
    if (!part) throw new Error(`Linh kiện ID ${detail.partId} không tồn tại`)
    if (part.stockQuantity < detail.quantity) {
      throw new Error(`Linh kiện "${part.name}" không đủ tồn kho (còn ${part.stockQuantity})`)
    }
  }

  return prisma.$transaction(async (tx) => {
    const partExport = await tx.partExport.create({
      data: {
        exportCode: data.exportCode,
        maintenanceRequestId: data.maintenanceRequestId,
        exportedBy: userId,
        exportDate: new Date(data.exportDate),
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
        maintenanceRequest: { select: { id: true, description: true } },
        details: { include: { part: true } }
      }
    })

    // Cập nhật tồn kho
    for (const detail of data.details) {
      await tx.part.update({
        where: { id: detail.partId },
        data: { stockQuantity: { decrement: detail.quantity } }
      })
    }

    return partExport
  })
}