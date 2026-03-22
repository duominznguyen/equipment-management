import prisma from '../../config/database.js'

export const getOverview = async () => {
  const [
    totalDevices, activeDevices, maintainingDevices, brokenDevices,
    totalCustomers, totalTechnicians,
    totalTickets, pendingTickets, processingTickets, resolvedTickets,
    totalContracts, activeContracts, expiredContracts,
    totalParts, lowStockParts,
  ] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { status: 'active' } }),
    prisma.device.count({ where: { status: 'maintaining' } }),
    prisma.device.count({ where: { status: 'broken' } }),
    prisma.customer.count(),
    prisma.technician.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'pending' } }),
    prisma.ticket.count({ where: { status: 'processing' } }),
    prisma.ticket.count({ where: { status: 'resolved' } }),
    prisma.warrantyContract.count(),
    prisma.warrantyContract.count({ where: { status: 'active' } }),
    prisma.warrantyContract.count({ where: { status: 'expired' } }),
    prisma.part.count(),
    prisma.part.findMany({
      where: { stockQuantity: { lte: prisma.part.fields.minQuantity } }
    }).then(parts => parts.filter(p => p.stockQuantity <= p.minQuantity).length),
  ])

  return {
    devices: { total: totalDevices, active: activeDevices, maintaining: maintainingDevices, broken: brokenDevices },
    people: { customers: totalCustomers, technicians: totalTechnicians },
    tickets: { total: totalTickets, pending: pendingTickets, processing: processingTickets, resolved: resolvedTickets },
    contracts: { total: totalContracts, active: activeContracts, expired: expiredContracts },
    parts: { total: totalParts, lowStock: lowStockParts },
  }
}

export const getMaintenanceReport = async (query: any) => {
  const { startDate, endDate } = query
  const where: any = {}
  if (startDate) where.createdAt = { gte: new Date(startDate) }
  if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) }

  const [total, pending, processing, completed] = await Promise.all([
    prisma.maintenanceRequest.count({ where }),
    prisma.maintenanceRequest.count({ where: { ...where, status: 'pending' } }),
    prisma.maintenanceRequest.count({ where: { ...where, status: 'processing' } }),
    prisma.maintenanceRequest.count({ where: { ...where, status: 'completed' } }),
  ])

  const recentRequests = await prisma.maintenanceRequest.findMany({
    where,
    include: {
      device: { select: { name: true, serialNumber: true } },
      technician: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return { summary: { total, pending, processing, completed }, recentRequests }
}

export const getPartsCostReport = async (query: any) => {
  const { startDate, endDate } = query
  const where: any = {}
  if (startDate) where.exportDate = { gte: new Date(startDate) }
  if (endDate) where.exportDate = { ...where.exportDate, lte: new Date(endDate) }

  const exports = await prisma.partExport.findMany({
    where,
    include: {
      details: { include: { part: true } }
    }
  })

  const totalCost = exports.reduce((sum, exp) =>
    sum + exp.details.reduce((s, d) => s + Number(d.unitPrice) * d.quantity, 0), 0
  )

  const partUsage = exports.flatMap(e => e.details).reduce((acc: any, detail) => {
    const key = detail.part.name
    if (!acc[key]) acc[key] = { name: key, quantity: 0, totalCost: 0 }
    acc[key].quantity += detail.quantity
    acc[key].totalCost += Number(detail.unitPrice) * detail.quantity
    return acc
  }, {})

  return {
    totalCost,
    totalExports: exports.length,
    partUsage: Object.values(partUsage),
  }
}