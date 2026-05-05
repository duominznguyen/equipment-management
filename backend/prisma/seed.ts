import bcrypt from 'bcryptjs'
import prisma from '../src/config/database.js'

const seed = async () => {
  console.log('🌱 Bắt đầu seed data...\n')

  // ==========================================
  // 1. USERS & PROFILES
  // ==========================================
  const adminHash = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, email: 'admin@ems.vn', role: 'admin', isActive: true },
  })

  const tech1Hash = await bcrypt.hash('tech123', 10)
  const tech1User = await prisma.user.upsert({
    where: { username: 'technician1' },
    update: {},
    create: { username: 'technician1', passwordHash: tech1Hash, email: 'tech1@ems.vn', role: 'technician', isActive: true },
  })
  const tech2Hash = await bcrypt.hash('tech123', 10)
  const tech2User = await prisma.user.upsert({
    where: { username: 'technician2' },
    update: {},
    create: { username: 'technician2', passwordHash: tech2Hash, email: 'tech2@ems.vn', role: 'technician', isActive: true },
  })

  const cust1Hash = await bcrypt.hash('cust123', 10)
  const cust1User = await prisma.user.upsert({
    where: { username: 'customer1' },
    update: {},
    create: { username: 'customer1', passwordHash: cust1Hash, email: 'customer1@abc.vn', role: 'customer', isActive: true },
  })
  const cust2Hash = await bcrypt.hash('cust123', 10)
  const cust2User = await prisma.user.upsert({
    where: { username: 'customer2' },
    update: {},
    create: { username: 'customer2', passwordHash: cust2Hash, email: 'customer2@xyz.vn', role: 'customer', isActive: true },
  })
  const cust3Hash = await bcrypt.hash('cust123', 10)
  const cust3User = await prisma.user.upsert({
    where: { username: 'customer3' },
    update: {},
    create: { username: 'customer3', passwordHash: cust3Hash, email: 'customer3@def.vn', role: 'customer', isActive: true },
  })
  console.log('✅ Users: 1 admin, 2 KTV, 3 khách hàng')

  // ==========================================
  // 2. DEVICE CATEGORIES
  // ==========================================
  const cat1 = await prisma.deviceCategory.upsert({
    where: { id: 1 }, update: {},
    create: { name: 'Máy tính để bàn', description: 'Desktop PC các loại' },
  })
  const cat2 = await prisma.deviceCategory.upsert({
    where: { id: 2 }, update: {},
    create: { name: 'Laptop', description: 'Máy tính xách tay các loại' },
  })
  const cat3 = await prisma.deviceCategory.upsert({
    where: { id: 3 }, update: {},
    create: { name: 'Máy in & Photocopy', description: 'Máy in laser, màu, photocopy' },
  })
  const cat4 = await prisma.deviceCategory.upsert({
    where: { id: 4 }, update: {},
    create: { name: 'Máy chủ (Server)', description: 'Máy chủ, NAS, thiết bị mạng' },
  })
  console.log('✅ Device Categories: 4 loại')

  // ==========================================
  // 3. TECHNICIAN PROFILES & SKILLS
  // ==========================================
  const tech1 = await prisma.technician.upsert({
    where: { userId: tech1User.id }, update: {},
    create: { userId: tech1User.id, fullName: 'Nguyễn Văn Kỹ Thuật', phone: '0901111111' },
  })
  const tech2 = await prisma.technician.upsert({
    where: { userId: tech2User.id }, update: {},
    create: { userId: tech2User.id, fullName: 'Trần Thị Bảo Trì', phone: '0902222222' },
  })

  await prisma.technicianSkill.deleteMany({ where: { technicianId: { in: [tech1.id, tech2.id] } } })
  await prisma.technicianSkill.createMany({
    data: [
      { technicianId: tech1.id, deviceCategoryId: cat1.id },
      { technicianId: tech1.id, deviceCategoryId: cat2.id },
      { technicianId: tech1.id, deviceCategoryId: cat4.id },
      { technicianId: tech2.id, deviceCategoryId: cat3.id },
      { technicianId: tech2.id, deviceCategoryId: cat2.id },
    ],
  })
  console.log('✅ Technicians: 2 KTV với kỹ năng tương ứng')

  // ==========================================
  // 4. CUSTOMER PROFILES
  // ==========================================
  const cust1 = await prisma.customer.upsert({
    where: { userId: cust1User.id }, update: {},
    create: { userId: cust1User.id, fullName: 'Nguyễn Văn An', phone: '0903333333', additionalInfo: 'Công ty TNHH ABC | 123 Lê Lợi, Q.1, HCM' },
  })
  const cust2 = await prisma.customer.upsert({
    where: { userId: cust2User.id }, update: {},
    create: { userId: cust2User.id, fullName: 'Trần Thị Bình', phone: '0904444444', additionalInfo: 'Công ty CP XYZ | 456 Nguyễn Huệ, Q.1, HCM' },
  })
  const cust3 = await prisma.customer.upsert({
    where: { userId: cust3User.id }, update: {},
    create: { userId: cust3User.id, fullName: 'Lê Minh Cường', phone: '0905555555', additionalInfo: 'Công ty DEF | 789 Hai Bà Trưng, Q.3, HCM' },
  })
  console.log('✅ Customers: 3 khách hàng')

  // ==========================================
  // 5. DEVICES
  // ==========================================
  const device1 = await prisma.device.upsert({
    where: { serialNumber: 'SN-PC-001' }, update: {},
    create: { categoryId: cat1.id, customerId: cust1.id, name: 'PC Kế toán A', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'SN-PC-001', address: 'Phòng Kế toán, Tầng 3', purchaseDate: new Date('2022-03-15'), status: 'active' },
  })
  const device2 = await prisma.device.upsert({
    where: { serialNumber: 'SN-LT-001' }, update: {},
    create: { categoryId: cat2.id, customerId: cust1.id, name: 'Laptop Giám đốc', brand: 'HP', model: 'EliteBook 840 G8', serialNumber: 'SN-LT-001', address: 'Phòng Giám đốc, Tầng 5', purchaseDate: new Date('2023-01-20'), status: 'active' },
  })
  const device3 = await prisma.device.upsert({
    where: { serialNumber: 'SN-PR-001' }, update: {},
    create: { categoryId: cat3.id, customerId: cust2.id, name: 'Máy in Văn phòng B2', brand: 'Canon', model: 'imageRUNNER 2625i', serialNumber: 'SN-PR-001', address: 'Khu in ấn, Tầng 2', purchaseDate: new Date('2021-06-10'), status: 'maintaining' },
  })
  const device4 = await prisma.device.upsert({
    where: { serialNumber: 'SN-SV-001' }, update: {},
    create: { categoryId: cat4.id, customerId: cust2.id, name: 'Server Dữ liệu', brand: 'Dell', model: 'PowerEdge R740', serialNumber: 'SN-SV-001', address: 'Phòng Server, Tầng B1', purchaseDate: new Date('2020-09-01'), status: 'active' },
  })
  const device5 = await prisma.device.upsert({
    where: { serialNumber: 'SN-LT-002' }, update: {},
    create: { categoryId: cat2.id, customerId: cust3.id, name: 'Laptop Nhân viên C1', brand: 'Lenovo', model: 'ThinkPad E15', serialNumber: 'SN-LT-002', address: 'Phòng Kinh doanh, Tầng 4', purchaseDate: new Date('2023-07-05'), status: 'error' },
  })
  console.log('✅ Devices: 5 thiết bị')

  // ==========================================
  // 6. WARRANTY CONTRACTS
  // ==========================================
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-2022-001' }, update: {},
    create: { deviceId: device1.id, contractNumber: 'WC-2022-001', startDate: new Date('2022-03-15'), endDate: new Date('2025-03-15'), terms: 'Bảo hành toàn bộ linh kiện 3 năm, hỗ trợ onsite trong 24h', status: 'active' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-2023-001' }, update: {},
    create: { deviceId: device2.id, contractNumber: 'WC-2023-001', startDate: new Date('2023-01-20'), endDate: new Date('2024-01-20'), terms: 'Bảo hành màn hình và pin 1 năm', status: 'expired' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-2021-001' }, update: {},
    create: { deviceId: device3.id, contractNumber: 'WC-2021-001', startDate: new Date('2021-06-10'), endDate: new Date('2026-06-10'), terms: 'Bảo hành đầu drum và linh kiện chính 5 năm', status: 'active' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-2020-001' }, update: {},
    create: { deviceId: device4.id, contractNumber: 'WC-2020-001', startDate: new Date('2020-09-01'), endDate: new Date('2025-09-01'), terms: 'Bảo hành phần cứng 5 năm, hỗ trợ 24/7', status: 'active' },
  })
  console.log('✅ Warranty Contracts: 4 hợp đồng')

  // ==========================================
  // 7. PARTS
  // ==========================================
  const part1 = await prisma.part.upsert({
    where: { code: 'RAM-DDR4-8G' }, update: {},
    create: { name: 'RAM DDR4 8GB', code: 'RAM-DDR4-8G', unit: 'cái', stockQuantity: 15, minQuantity: 3, description: 'RAM DDR4 8GB 3200MHz Kingston' },
  })
  const part2 = await prisma.part.upsert({
    where: { code: 'SSD-SATA-256' }, update: {},
    create: { name: 'SSD SATA 256GB', code: 'SSD-SATA-256', unit: 'cái', stockQuantity: 8, minQuantity: 2, description: 'SSD Samsung 860 EVO 256GB SATA' },
  })
  const part3 = await prisma.part.upsert({
    where: { code: 'INK-CANON-BK-337' }, update: {},
    create: { name: 'Mực in Canon 337 (đen)', code: 'INK-CANON-BK-337', unit: 'hộp', stockQuantity: 12, minQuantity: 3, description: 'Hộp mực gốc Canon 337 màu đen' },
  })
  const part4 = await prisma.part.upsert({
    where: { code: 'PWR-500W-ATX' }, update: {},
    create: { name: 'Nguồn máy tính 500W', code: 'PWR-500W-ATX', unit: 'cái', stockQuantity: 5, minQuantity: 1, description: 'Nguồn ATX 500W chuẩn 80 Plus Bronze' },
  })
  const part5 = await prisma.part.upsert({
    where: { code: 'DRUM-CANON-337' }, update: {},
    create: { name: 'Drum máy in Canon', code: 'DRUM-CANON-337', unit: 'cái', stockQuantity: 3, minQuantity: 1, description: 'Cụm trống Canon 326/328/329' },
  })
  const part6 = await prisma.part.upsert({
    where: { code: 'NET-CABLE-CAT6' }, update: {},
    create: { name: 'Cáp mạng CAT6 (cuộn 50m)', code: 'NET-CABLE-CAT6', unit: 'cuộn', stockQuantity: 6, minQuantity: 2, description: 'Cáp mạng Cat6 UTP 50m AMP' },
  })
  console.log('✅ Parts: 6 linh kiện')

  // ==========================================
  // 8. PART IMPORTS
  // ==========================================
  const import1 = await prisma.partImport.upsert({
    where: { id: 1 }, update: {},
    create: { importedBy: adminUser.id, supplier: 'Công ty Phân phối Linh kiện Thành Công', importDate: new Date('2024-01-10'), totalCost: 28500000, note: 'Nhập linh kiện đầu năm 2024 - Đợt 1' },
  })
  await prisma.partImportDetail.upsert({ where: { id: 1 }, update: {}, create: { importId: import1.id, partId: part1.id, quantity: 10, unitPrice: 800000 } })
  await prisma.partImportDetail.upsert({ where: { id: 2 }, update: {}, create: { importId: import1.id, partId: part2.id, quantity: 5, unitPrice: 1500000 } })
  await prisma.partImportDetail.upsert({ where: { id: 3 }, update: {}, create: { importId: import1.id, partId: part4.id, quantity: 3, unitPrice: 800000 } })

  const import2 = await prisma.partImport.upsert({
    where: { id: 2 }, update: {},
    create: { importedBy: adminUser.id, supplier: 'Đại lý Canon Phương Nam', importDate: new Date('2024-03-05'), totalCost: 18000000, note: 'Nhập vật tư máy in' },
  })
  await prisma.partImportDetail.upsert({ where: { id: 4 }, update: {}, create: { importId: import2.id, partId: part3.id, quantity: 12, unitPrice: 650000 } })
  await prisma.partImportDetail.upsert({ where: { id: 5 }, update: {}, create: { importId: import2.id, partId: part5.id, quantity: 3, unitPrice: 2200000 } })
  console.log('✅ Part Imports: 2 phiếu nhập, 5 chi tiết')

  // ==========================================
  // 9. TICKETS
  // ==========================================
  const ticket1 = await prisma.ticket.upsert({
    where: { id: 1 }, update: {},
    create: { deviceId: device1.id, title: 'Máy tính không khởi động', description: 'Bật nguồn máy lên nhưng không có tín hiệu màn hình, đèn nguồn nhấp nháy liên tục.', priority: 'high', status: 'processing' },
  })
  const ticket2 = await prisma.ticket.upsert({
    where: { id: 2 }, update: {},
    create: { deviceId: device3.id, title: 'Máy in kẹt giấy liên tục', description: 'Sau khi in khoảng 5-10 tờ thì máy báo kẹt giấy, đã thử lấy giấy ra nhưng vẫn tiếp diễn.', priority: 'medium', status: 'pending' },
  })
  const ticket3 = await prisma.ticket.upsert({
    where: { id: 3 }, update: {},
    create: { deviceId: device5.id, title: 'Laptop không nhận sạc', description: 'Cắm sạc vào nhưng máy không nhận, đèn sạc không sáng. Pin đã gần hết.', priority: 'high', status: 'pending' },
  })
  const ticket4 = await prisma.ticket.upsert({
    where: { id: 4 }, update: {},
    create: { deviceId: device2.id, title: 'Laptop chạy chậm bất thường', description: 'Máy mở ứng dụng rất lâu, RAM và CPU thường xuyên 90-100%. Nghi ngờ nhiễm virus hoặc phần cứng có vấn đề.', priority: 'low', status: 'resolved' },
  })
  console.log('✅ Tickets: 4 ticket (1 đang xử lý, 2 chờ, 1 giải quyết)')

  // ==========================================
  // 10. MAINTENANCE SCHEDULES
  // ==========================================
  await prisma.maintenanceSchedule.upsert({
    where: { id: 1 }, update: {},
    create: { deviceId: device2.id, lastMaintenanceDate: new Date('2024-11-01'), nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), leadTimeDays: 7, isHandled: false, isContinueMaintain: true },
  })
  await prisma.maintenanceSchedule.upsert({
    where: { id: 2 }, update: {},
    create: { deviceId: device4.id, lastMaintenanceDate: new Date('2025-02-01'), nextMaintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), leadTimeDays: 14, isHandled: false, isContinueMaintain: true },
  })
  await prisma.maintenanceSchedule.upsert({
    where: { id: 3 }, update: {},
    create: { deviceId: device1.id, lastMaintenanceDate: new Date('2025-01-15'), nextMaintenanceDate: new Date('2025-04-15'), leadTimeDays: 7, isHandled: true, isContinueMaintain: true },
  })
  console.log('✅ Maintenance Schedules: 3 lịch (2 sắp tới, 1 đã xử lý)')

  // ==========================================
  // 11. WORK ORDERS
  // ==========================================
  const wo1 = await prisma.workOrder.upsert({
    where: { id: 1 }, update: {},
    create: { ticketId: ticket1.id, technicianId: tech1.id, workDescription: 'Kiểm tra và sửa chữa máy tính không khởi động. Nghi ngờ lỗi nguồn hoặc RAM.', status: 'processing', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  })
  const wo2 = await prisma.workOrder.upsert({
    where: { id: 2 }, update: {},
    create: { ticketId: ticket4.id, technicianId: tech1.id, workDescription: 'Kiểm tra hiệu năng, quét virus và nâng cấp RAM nếu cần.', status: 'completed', startedAt: new Date('2025-04-20'), completedAt: new Date('2025-04-21') },
  })
  const wo3 = await prisma.workOrder.upsert({
    where: { id: 3 }, update: {},
    create: { maintenanceScheduleId: 3, technicianId: tech2.id, workDescription: 'Bảo trì định kỳ PC Kế toán A: vệ sinh, kiểm tra phần cứng, cập nhật phần mềm.', status: 'completed', startedAt: new Date('2025-01-15'), completedAt: new Date('2025-01-15') },
  })
  console.log('✅ Work Orders: 3 phiếu (1 đang xử lý, 2 hoàn thành)')

  // ==========================================
  // 12. PART USAGES (ghi nhận linh kiện đã dùng trong WO)
  // ==========================================
  await prisma.partUsage.upsert({ where: { id: 1 }, update: {}, create: { workOrderId: wo1.id, partId: part1.id, quantityUsage: 1 } })
  await prisma.partUsage.upsert({ where: { id: 2 }, update: {}, create: { workOrderId: wo2.id, partId: part2.id, quantityUsage: 1 } })
  await prisma.partUsage.upsert({ where: { id: 3 }, update: {}, create: { workOrderId: wo3.id, partId: part1.id, quantityUsage: 1 } })
  console.log('✅ Part Usages: 3 bản ghi sử dụng linh kiện')

  // ==========================================
  // 13. PART EXPORTS (xuất kho thực sự, trừ tồn kho)
  // ==========================================
  const export1 = await prisma.partExport.upsert({
    where: { id: 1 }, update: {},
    create: { technicianId: tech1.id, workOrderId: wo2.id, exportDate: new Date('2025-04-20'), reason: 'Xuất kho SSD để nâng cấp cho laptop chậm', status: 'completed' },
  })
  await prisma.partExportDetail.upsert({ where: { id: 1 }, update: {}, create: { exportId: export1.id, partId: part2.id, quantity: 1 } })

  const export2 = await prisma.partExport.upsert({
    where: { id: 2 }, update: {},
    create: { technicianId: tech2.id, workOrderId: wo3.id, exportDate: new Date('2025-01-15'), reason: 'Xuất mực in dùng cho bảo trì định kỳ máy in', status: 'completed' },
  })
  await prisma.partExportDetail.upsert({ where: { id: 2 }, update: {}, create: { exportId: export2.id, partId: part3.id, quantity: 2 } })
  console.log('✅ Part Exports: 2 phiếu xuất kho')

  // ==========================================
  // TỔNG KẾT
  // ==========================================
  console.log('\n🎉 Seed data hoàn thành!')
  console.log('\n📋 ===== TÀI KHOẢN TEST =====')
  console.log('Admin     | admin       / admin123')
  console.log('KTV 1     | technician1 / tech123   (PC, Laptop, Server)')
  console.log('KTV 2     | technician2 / tech123   (Máy in, Laptop)')
  console.log('Khách 1   | customer1   / cust123   (Công ty ABC — 2 thiết bị)')
  console.log('Khách 2   | customer2   / cust123   (Công ty XYZ — 2 thiết bị)')
  console.log('Khách 3   | customer3   / cust123   (Công ty DEF — 1 thiết bị)')
  console.log('\n📊 ===== DỮ LIỆU KHỞI TẠO =====')
  console.log('🔧 Tickets  : 4 (pending×2, processing×1, resolved×1)')
  console.log('📋 WorkOrders: 3 (pending×0, processing×1, completed×2)')
  console.log('📦 Parts    : 6 loại linh kiện trong kho')
  console.log('📅 Schedules: 3 lịch bảo trì')

  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('❌ Seed thất bại:', e)
  await prisma.$disconnect()
  process.exit(1)
})
