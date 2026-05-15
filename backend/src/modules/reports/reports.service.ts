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
    prisma.part.findMany().then(parts => parts.filter(p => p.stockQuantity <= p.minQuantity).length),
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
    prisma.workOrder.count({ where }),
    prisma.workOrder.count({ where: { ...where, status: 'pending' } }),
    prisma.workOrder.count({ where: { ...where, status: 'processing' } }),
    prisma.workOrder.count({ where: { ...where, status: 'completed' } }),
  ])

  const recentWorkOrders = await prisma.workOrder.findMany({
    where,
    include: {
      technician: { select: { fullName: true } },
      ticket: { include: { device: { select: { name: true, serialNumber: true } } } },
      maintenanceSchedule: { include: { device: { select: { name: true, serialNumber: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Format to match old shape
  const recentRequests = recentWorkOrders.map(wo => ({
    id: wo.id,
    status: wo.status,
    createdAt: wo.createdAt,
    device: wo.ticket?.device || wo.maintenanceSchedule?.device,
    technician: wo.technician
  }))

  return { summary: { total, pending, processing, completed }, recentRequests }
}

export const getPartsCostReport = async (query: any) => {
  const { startDate, endDate } = query
  const where: any = {}
  if (startDate) where.createdAt = { gte: new Date(startDate) }
  if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) }

  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      partUsages: { include: { part: true } }
    }
  })

  const partUsageList = workOrders.flatMap(wo => wo.partUsages)

  const partUsageMap = partUsageList.reduce((acc: any, usage) => {
    const key = usage.part.name
    if (!acc[key]) acc[key] = { name: key, quantity: 0, totalCost: 0 }
    acc[key].quantity += usage.quantityUsage
    return acc
  }, {})

  return {
    totalCost: 0, // Không còn lưu giá xuất trong DB mới
    totalExports: workOrders.length,
    partUsage: Object.values(partUsageMap),
  }
}