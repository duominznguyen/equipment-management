import prisma from '../../config/database.js'
import { getPaginationParams, paginate } from '../../utils/pagination.js'

export const getAll = async (query: any) => {
  const params = getPaginationParams(query)
  return paginate(prisma.partImport, params, {
    include: {
      user: { select: { id: true, username: true } },
      details: { include: { part: true } }
    },
    orderBy: { importDate: 'desc' }
  })
}

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
  importCode: string; supplier: string
  importDate: string; note?: string
  details: { partId: number; quantity: number; unitPrice: number }[]
}) => {
  const existing = await prisma.partImport.findUnique({ where: { importCode: data.importCode } })
  if (existing) throw new Error('Mã phiếu nhập đã tồn tại')

  const totalCost = data.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0)

  return prisma.$transaction(async (tx) => {
    const partImport = await tx.partImport.create({
      data: {
        importCode: data.importCode,
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