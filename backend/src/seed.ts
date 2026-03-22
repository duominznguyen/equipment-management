import bcrypt from 'bcryptjs'
import prisma from './config/database.js'

const seed = async () => {
  console.log('🌱 Bắt đầu seed data...')

  // ==========================================
  // USERS
  // ==========================================
  const adminHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }
  })
  console.log('✅ Admin:', admin.username)

  // ==========================================
  // TECHNICIANS
  // ==========================================
  const tech1Hash = await bcrypt.hash('tech123', 10)
  const tech1User = await prisma.user.upsert({
    where: { username: 'technician1' },
    update: {},
    create: {
      username: 'technician1',
      passwordHash: tech1Hash,
      email: 'tech1@example.com',
      role: 'technician',
      isActive: true,
    }
  })
  const tech1 = await prisma.technician.upsert({
    where: { userId: tech1User.id },
    update: {},
    create: {
      userId: tech1User.id,
      fullName: 'Nguyễn Văn Kỹ Thuật',
      phone: '0901111111',
      specialization: 'Máy tính, Laptop',
    }
  })
  console.log('✅ Technician:', tech1.fullName)

  const tech2Hash = await bcrypt.hash('tech123', 10)
  const tech2User = await prisma.user.upsert({
    where: { username: 'technician2' },
    update: {},
    create: {
      username: 'technician2',
      passwordHash: tech2Hash,
      email: 'tech2@example.com',
      role: 'technician',
      isActive: true,
    }
  })
  const tech2 = await prisma.technician.upsert({
    where: { userId: tech2User.id },
    update: {},
    create: {
      userId: tech2User.id,
      fullName: 'Trần Thị Kỹ Thuật',
      phone: '0902222222',
      specialization: 'Máy in, Máy photocopy',
    }
  })
  console.log('✅ Technician:', tech2.fullName)

  // ==========================================
  // CUSTOMERS
  // ==========================================
  const cust1Hash = await bcrypt.hash('cust123', 10)
  const cust1User = await prisma.user.upsert({
    where: { username: 'customer1' },
    update: {},
    create: {
      username: 'customer1',
      passwordHash: cust1Hash,
      email: 'customer1@example.com',
      role: 'customer',
      isActive: true,
    }
  })
  const cust1 = await prisma.customer.upsert({
    where: { userId: cust1User.id },
    update: {},
    create: {
      userId: cust1User.id,
      fullName: 'Nguyễn Văn An',
      phone: '0903333333',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      companyName: 'Công ty TNHH ABC',
    }
  })
  console.log('✅ Customer:', cust1.fullName)

  const cust2Hash = await bcrypt.hash('cust123', 10)
  const cust2User = await prisma.user.upsert({
    where: { username: 'customer2' },
    update: {},
    create: {
      username: 'customer2',
      passwordHash: cust2Hash,
      email: 'customer2@example.com',
      role: 'customer',
      isActive: true,
    }
  })
  const cust2 = await prisma.customer.upsert({
    where: { userId: cust2User.id },
    update: {},
    create: {
      userId: cust2User.id,
      fullName: 'Trần Thị Bình',
      phone: '0904444444',
      address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      companyName: 'Công ty CP XYZ',
    }
  })
  console.log('✅ Customer:', cust2.fullName)

  // ==========================================
  // DEVICE CATEGORIES
  // ==========================================
  const cat1 = await prisma.deviceCategory.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Máy tính để bàn', description: 'Desktop PC các loại' }
  })
  const cat2 = await prisma.deviceCategory.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Laptop', description: 'Máy tính xách tay các loại' }
  })
  const cat3 = await prisma.deviceCategory.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Máy in', description: 'Máy in, máy photocopy' }
  })
  console.log('✅ Device Categories: 3 loại')

  // ==========================================
  // DEVICES
  // ==========================================
  const device1 = await prisma.device.upsert({
    where: { serialNumber: 'SN001' },
    update: {},
    create: {
      categoryId: cat1.id,
      customerId: cust1.id,
      name: 'PC Văn phòng A',
      brand: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: 'SN001',
      purchaseDate: new Date('2023-01-15'),
      status: 'active',
    }
  })
  const device2 = await prisma.device.upsert({
    where: { serialNumber: 'SN002' },
    update: {},
    create: {
      categoryId: cat2.id,
      customerId: cust1.id,
      name: 'Laptop Giám đốc',
      brand: 'HP',
      model: 'EliteBook 840',
      serialNumber: 'SN002',
      purchaseDate: new Date('2023-03-20'),
      status: 'active',
    }
  })
  const device3 = await prisma.device.upsert({
    where: { serialNumber: 'SN003' },
    update: {},
    create: {
      categoryId: cat3.id,
      customerId: cust2.id,
      name: 'Máy in văn phòng',
      brand: 'Canon',
      model: 'imageRUNNER 2625',
      serialNumber: 'SN003',
      purchaseDate: new Date('2022-06-10'),
      status: 'maintaining',
    }
  })
  console.log('✅ Devices: 3 thiết bị')

  // ==========================================
  // WARRANTY CONTRACTS
  // ==========================================
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC001' },
    update: {},
    create: {
      deviceId: device1.id,
      customerId: cust1.id,
      contractNumber: 'WC001',
      startDate: new Date('2023-01-15'),
      endDate: new Date('2025-01-15'),
      terms: 'Bảo hành toàn bộ linh kiện trong 2 năm',
      status: 'active',
    }
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC002' },
    update: {},
    create: {
      deviceId: device2.id,
      customerId: cust1.id,
      contractNumber: 'WC002',
      startDate: new Date('2023-03-20'),
      endDate: new Date('2024-03-20'),
      terms: 'Bảo hành màn hình và pin trong 1 năm',
      status: 'expired',
    }
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC003' },
    update: {},
    create: {
      deviceId: device3.id,
      customerId: cust2.id,
      contractNumber: 'WC003',
      startDate: new Date('2022-06-10'),
      endDate: new Date('2026-06-10'),
      terms: 'Bảo hành linh kiện và hỗ trợ kỹ thuật 4 năm',
      status: 'active',
    }
  })
  console.log('✅ Warranty Contracts: 3 hợp đồng')

  // ==========================================
  // TICKETS
  // ==========================================
  const ticket1 = await prisma.ticket.upsert({
    where: { id: 1 },
    update: {},
    create: {
      customerId: cust1.id,
      deviceId: device1.id,
      title: 'Máy tính không khởi động được',
      description: 'Bật nguồn máy tính nhưng không lên màn hình, đèn nguồn nhấp nháy',
      priority: 'high',
      status: 'processing',
    }
  })
  const ticket2 = await prisma.ticket.upsert({
    where: { id: 2 },
    update: {},
    create: {
      customerId: cust2.id,
      deviceId: device3.id,
      title: 'Máy in bị kẹt giấy liên tục',
      description: 'Máy in bị kẹt giấy sau mỗi 5-10 tờ in',
      priority: 'medium',
      status: 'pending',
    }
  })
  console.log('✅ Tickets: 2 ticket')

  // ==========================================
  // MAINTENANCE REQUESTS
  // ==========================================
  const mr1 = await prisma.maintenanceRequest.upsert({
    where: { id: 1 },
    update: {},
    create: {
      ticketId: ticket1.id,
      deviceId: device1.id,
      technicianId: tech1.id,
      description: 'Kiểm tra và sửa chữa máy tính không khởi động',
      type: 'repair',
      status: 'processing',
      startedAt: new Date(),
    }
  })
  console.log('✅ Maintenance Requests: 1 phiếu')

  // ==========================================
  // MAINTENANCE SCHEDULES
  // ==========================================
  await prisma.maintenanceSchedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      deviceId: device2.id,
      technicianId: tech1.id,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày tới
      description: 'Bảo trì định kỳ laptop - vệ sinh, kiểm tra phần cứng',
      status: 'upcoming',
    }
  })
  await prisma.maintenanceSchedule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      deviceId: device3.id,
      technicianId: tech2.id,
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 ngày tới
      description: 'Bảo trì máy in - vệ sinh đầu in, kiểm tra trục cuốn giấy',
      status: 'upcoming',
    }
  })
  console.log('✅ Maintenance Schedules: 2 lịch')

  // ==========================================
  // PARTS
  // ==========================================
  const part1 = await prisma.part.upsert({
    where: { code: 'RAM-DDR4-8G' },
    update: {},
    create: {
      name: 'RAM DDR4 8GB',
      code: 'RAM-DDR4-8G',
      unit: 'cái',
      stockQuantity: 10,
      minQuantity: 2,
      description: 'RAM DDR4 8GB 3200MHz',
    }
  })
  const part2 = await prisma.part.upsert({
    where: { code: 'HDD-1TB' },
    update: {},
    create: {
      name: 'Ổ cứng HDD 1TB',
      code: 'HDD-1TB',
      unit: 'cái',
      stockQuantity: 5,
      minQuantity: 1,
      description: 'Ổ cứng HDD Seagate 1TB 7200RPM',
    }
  })
  const part3 = await prisma.part.upsert({
    where: { code: 'INK-CANON-BK' },
    update: {},
    create: {
      name: 'Mực máy in Canon đen',
      code: 'INK-CANON-BK',
      unit: 'hộp',
      stockQuantity: 8,
      minQuantity: 2,
      description: 'Hộp mực Canon 337 màu đen',
    }
  })
  console.log('✅ Parts: 3 linh kiện')

  // ==========================================
  // PART IMPORTS
  // ==========================================
  const import1 = await prisma.partImport.upsert({
    where: { importCode: 'IMP001' },
    update: {},
    create: {
      importCode: 'IMP001',
      importedBy: admin.id,
      supplier: 'Công ty Phân phối Linh kiện ABC',
      importDate: new Date('2024-01-10'),
      totalCost: 15000000,
      note: 'Nhập linh kiện đầu năm 2024',
    }
  })
  await prisma.partImportDetail.upsert({
    where: { id: 1 },
    update: {},
    create: {
      importId: import1.id,
      partId: part1.id,
      quantity: 5,
      unitPrice: 1500000,
    }
  })
  await prisma.partImportDetail.upsert({
    where: { id: 2 },
    update: {},
    create: {
      importId: import1.id,
      partId: part2.id,
      quantity: 3,
      unitPrice: 1800000,
    }
  })
  console.log('✅ Part Imports: 1 phiếu nhập')

  // ==========================================
  // PART EXPORTS
  // ==========================================
  const export1 = await prisma.partExport.upsert({
    where: { exportCode: 'EXP001' },
    update: {},
    create: {
      exportCode: 'EXP001',
      maintenanceRequestId: mr1.id,
      exportedBy: tech1User.id,
      exportDate: new Date(),
      note: 'Xuất linh kiện sửa PC không khởi động',
    }
  })
  await prisma.partExportDetail.upsert({
    where: { id: 1 },
    update: {},
    create: {
      exportId: export1.id,
      partId: part1.id,
      quantity: 1,
      unitPrice: 1500000,
    }
  })
  console.log('✅ Part Exports: 1 phiếu xuất')

  console.log('\n🎉 Seed data hoàn thành!')
  console.log('\n📋 Tài khoản test:')
  console.log('Admin     | username: admin       | password: admin123')
  console.log('KTV 1     | username: technician1 | password: tech123')
  console.log('KTV 2     | username: technician2 | password: tech123')
  console.log('Khách 1   | username: customer1   | password: cust123')
  console.log('Khách 2   | username: customer2   | password: cust123')

  await prisma.$disconnect()
}

seed().catch(console.error)