import bcrypt from 'bcryptjs'
import prisma from '../src/config/database.js'

const seed = async () => {
  console.log('🌱 Bắt đầu seed data cho Máy móc Công nghiệp...\n')

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
    create: { username: 'customer1', passwordHash: cust1Hash, email: 'customer1@congtycongnghiep.vn', role: 'customer', isActive: true },
  })
  const cust2Hash = await bcrypt.hash('cust123', 10)
  const cust2User = await prisma.user.upsert({
    where: { username: 'customer2' },
    update: {},
    create: { username: 'customer2', passwordHash: cust2Hash, email: 'customer2@nhamaytoancau.vn', role: 'customer', isActive: true },
  })
  const cust3Hash = await bcrypt.hash('cust123', 10)
  const cust3User = await prisma.user.upsert({
    where: { username: 'customer3' },
    update: {},
    create: { username: 'customer3', passwordHash: cust3Hash, email: 'customer3@sanxuatviet.vn', role: 'customer', isActive: true },
  })
  console.log('✅ Users: 1 admin, 2 KTV, 3 khách hàng (Nhà máy)')

  // ==========================================
  // 2. DEVICE CATEGORIES
  // ==========================================
  const cat1 = await prisma.deviceCategory.upsert({
    where: { id: 1 }, update: { name: 'Máy phay/tiện CNC', description: 'Các dòng máy CNC gia công cơ khí chính xác' },
    create: { name: 'Máy phay/tiện CNC', description: 'Các dòng máy CNC gia công cơ khí chính xác' },
  })
  const cat2 = await prisma.deviceCategory.upsert({
    where: { id: 2 }, update: { name: 'Robot công nghiệp', description: 'Cánh tay robot hàn, gắp, lắp ráp tự động' },
    create: { name: 'Robot công nghiệp', description: 'Cánh tay robot hàn, gắp, lắp ráp tự động' },
  })
  const cat3 = await prisma.deviceCategory.upsert({
    where: { id: 3 }, update: { name: 'Máy nén khí & Bơm', description: 'Máy nén khí trục vít, bơm thuỷ lực công suất lớn' },
    create: { name: 'Máy nén khí & Bơm', description: 'Máy nén khí trục vít, bơm thuỷ lực công suất lớn' },
  })
  const cat4 = await prisma.deviceCategory.upsert({
    where: { id: 4 }, update: { name: 'Dây chuyền đóng gói', description: 'Hệ thống băng chuyền, máy chiết rót, đóng bao' },
    create: { name: 'Dây chuyền đóng gói', description: 'Hệ thống băng chuyền, máy chiết rót, đóng bao' },
  })
  console.log('✅ Device Categories: 4 loại máy móc công nghiệp')

  // ==========================================
  // 3. TECHNICIAN PROFILES & SKILLS
  // ==========================================
  const tech1 = await prisma.technician.upsert({
    where: { userId: tech1User.id }, update: { fullName: 'Kỹ sư Cơ điện tử' },
    create: { userId: tech1User.id, fullName: 'Kỹ sư Cơ điện tử', phone: '0901111111' },
  })
  const tech2 = await prisma.technician.upsert({
    where: { userId: tech2User.id }, update: { fullName: 'Kỹ sư Tự động hoá' },
    create: { userId: tech2User.id, fullName: 'Kỹ sư Tự động hoá', phone: '0902222222' },
  })

  await prisma.technicianSkill.deleteMany({ where: { technicianId: { in: [tech1.id, tech2.id] } } })
  await prisma.technicianSkill.createMany({
    data: [
      { technicianId: tech1.id, deviceCategoryId: cat1.id }, // CNC
      { technicianId: tech1.id, deviceCategoryId: cat3.id }, // Bơm, nén khí
      { technicianId: tech2.id, deviceCategoryId: cat2.id }, // Robot
      { technicianId: tech2.id, deviceCategoryId: cat4.id }, // Đóng gói
    ],
  })
  console.log('✅ Technicians: 2 Kỹ sư bảo trì với chuyên môn sâu')

  // ==========================================
  // 4. CUSTOMER PROFILES
  // ==========================================
  const cust1 = await prisma.customer.upsert({
    where: { userId: cust1User.id }, update: { fullName: 'Công ty Cơ khí Trí Việt', additionalInfo: 'Nhà máy số 1 | Lô E, KCN Sóng Thần, Bình Dương' },
    create: { userId: cust1User.id, fullName: 'Công ty Cơ khí Trí Việt', phone: '0903333333', additionalInfo: 'Nhà máy số 1 | Lô E, KCN Sóng Thần, Bình Dương' },
  })
  const cust2 = await prisma.customer.upsert({
    where: { userId: cust2User.id }, update: { fullName: 'Nhà máy Ô tô Tân Phát', additionalInfo: 'Phân xưởng lắp ráp | KCN VSIP 2, Bình Dương' },
    create: { userId: cust2User.id, fullName: 'Nhà máy Ô tô Tân Phát', phone: '0904444444', additionalInfo: 'Phân xưởng lắp ráp | KCN VSIP 2, Bình Dương' },
  })
  const cust3 = await prisma.customer.upsert({
    where: { userId: cust3User.id }, update: { fullName: 'Công ty Thực phẩm Á Châu', additionalInfo: 'Dây chuyền F&B | KCN Tân Tạo, HCM' },
    create: { userId: cust3User.id, fullName: 'Công ty Thực phẩm Á Châu', phone: '0905555555', additionalInfo: 'Dây chuyền F&B | KCN Tân Tạo, HCM' },
  })
  console.log('✅ Customers: 3 Khách hàng là nhà máy sản xuất')

  // ==========================================
  // 5. DEVICES
  // ==========================================
  const device1 = await prisma.device.upsert({
    where: { serialNumber: 'CNC-MAZAK-001' }, update: { categoryId: cat1.id, customerId: cust1.id, name: 'Máy phay CNC Mazak 5 trục', brand: 'Mazak', model: 'Integrex i-200' },
    create: { categoryId: cat1.id, customerId: cust1.id, name: 'Máy phay CNC Mazak 5 trục', brand: 'Mazak', model: 'Integrex i-200', serialNumber: 'CNC-MAZAK-001', address: 'Xưởng gia công 1', purchaseDate: new Date('2022-03-15'), status: 'active' },
  })
  const device2 = await prisma.device.upsert({
    where: { serialNumber: 'ROB-KUKA-KR210' }, update: { categoryId: cat2.id, customerId: cust2.id, name: 'Cánh tay Robot hàn tự động', brand: 'KUKA', model: 'KR 210' },
    create: { categoryId: cat2.id, customerId: cust2.id, name: 'Cánh tay Robot hàn tự động', brand: 'KUKA', model: 'KR 210', serialNumber: 'ROB-KUKA-KR210', address: 'Line hàn khung chassis', purchaseDate: new Date('2023-01-20'), status: 'active' },
  })
  const device3 = await prisma.device.upsert({
    where: { serialNumber: 'COMP-ATLAS-GA50' }, update: { categoryId: cat3.id, customerId: cust1.id, name: 'Máy nén khí trục vít', brand: 'Atlas Copco', model: 'GA 50 VSD+' },
    create: { categoryId: cat3.id, customerId: cust1.id, name: 'Máy nén khí trục vít', brand: 'Atlas Copco', model: 'GA 50 VSD+', serialNumber: 'COMP-ATLAS-GA50', address: 'Phòng kỹ thuật khí nén', purchaseDate: new Date('2021-06-10'), status: 'maintaining' },
  })
  const device4 = await prisma.device.upsert({
    where: { serialNumber: 'PACK-TETRA-001' }, update: { categoryId: cat4.id, customerId: cust3.id, name: 'Dây chuyền đóng chai nước', brand: 'Tetra Pak', model: 'A3/Speed' },
    create: { categoryId: cat4.id, customerId: cust3.id, name: 'Dây chuyền đóng chai nước', brand: 'Tetra Pak', model: 'A3/Speed', serialNumber: 'PACK-TETRA-001', address: 'Khu vực chiết rót V1', purchaseDate: new Date('2020-09-01'), status: 'active' },
  })
  const device5 = await prisma.device.upsert({
    where: { serialNumber: 'ROB-YASK-GP12' }, update: { categoryId: cat2.id, customerId: cust3.id, name: 'Robot gắp hàng pallet', brand: 'Yaskawa', model: 'Motoman GP12' },
    create: { categoryId: cat2.id, customerId: cust3.id, name: 'Robot gắp hàng pallet', brand: 'Yaskawa', model: 'Motoman GP12', serialNumber: 'ROB-YASK-GP12', address: 'Khu vực kho thành phẩm', purchaseDate: new Date('2023-07-05'), status: 'error' },
  })
  console.log('✅ Devices: 5 máy móc công nghiệp nặng')

  // ==========================================
  // 6. WARRANTY CONTRACTS
  // ==========================================
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-MAZAK-22' }, update: { deviceId: device1.id },
    create: { deviceId: device1.id, contractNumber: 'WC-MAZAK-22', startDate: new Date('2022-03-15'), endDate: new Date('2025-03-15'), terms: 'Bảo hành spindle 3 năm, hỗ trợ 24/7 onsite', status: 'active' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-KUKA-23' }, update: { deviceId: device2.id },
    create: { deviceId: device2.id, contractNumber: 'WC-KUKA-23', startDate: new Date('2023-01-20'), endDate: new Date('2024-01-20'), terms: 'Bảo hành motor servo và bộ điều khiển KRC', status: 'expired' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-ATLAS-21' }, update: { deviceId: device3.id },
    create: { deviceId: device3.id, contractNumber: 'WC-ATLAS-21', startDate: new Date('2021-06-10'), endDate: new Date('2026-06-10'), terms: 'Bảo hành đầu nén khí 5 năm, miễn phí dầu nhớt năm đầu', status: 'active' },
  })
  await prisma.warrantyContract.upsert({
    where: { contractNumber: 'WC-TETRA-20' }, update: { deviceId: device4.id },
    create: { deviceId: device4.id, contractNumber: 'WC-TETRA-20', startDate: new Date('2020-09-01'), endDate: new Date('2025-09-01'), terms: 'Bảo hành toàn bộ cảm biến và board mạch 5 năm', status: 'active' },
  })
  console.log('✅ Warranty Contracts: 4 hợp đồng bảo dưỡng')

  // ==========================================
  // 7. PARTS
  // ==========================================
  const part1 = await prisma.part.upsert({
    where: { code: 'SRV-MTR-YASKAWA' }, update: { name: 'Động cơ Servo Yaskawa 1.5kW', description: 'Động cơ Sigma-7, 1.5kW cho cánh tay robot' },
    create: { name: 'Động cơ Servo Yaskawa 1.5kW', code: 'SRV-MTR-YASKAWA', unit: 'bộ', stockQuantity: 8, minQuantity: 2, description: 'Động cơ Sigma-7, 1.5kW cho cánh tay robot' },
  })
  const part2 = await prisma.part.upsert({
    where: { code: 'SENS-OMRON-E2E' }, update: { name: 'Cảm biến tiệm cận Omron', description: 'Cảm biến quang học dùng cho băng tải đóng gói' },
    create: { name: 'Cảm biến tiệm cận Omron', code: 'SENS-OMRON-E2E', unit: 'cái', stockQuantity: 50, minQuantity: 10, description: 'Cảm biến quang học dùng cho băng tải đóng gói' },
  })
  const part3 = await prisma.part.upsert({
    where: { code: 'BRG-SKF-6205' }, update: { name: 'Vòng bi SKF 6205', description: 'Bạc đạn chịu nhiệt tốc độ cao cho Spindle CNC' },
    create: { name: 'Vòng bi SKF 6205', code: 'BRG-SKF-6205', unit: 'cái', stockQuantity: 100, minQuantity: 20, description: 'Bạc đạn chịu nhiệt tốc độ cao cho Spindle CNC' },
  })
  const part4 = await prisma.part.upsert({
    where: { code: 'OIL-ATLAS-ROTO' }, update: { name: 'Dầu nén khí Roto Inject Fluid', description: 'Dầu chuyên dụng cho máy nén khí Atlas Copco (20L)' },
    create: { name: 'Dầu nén khí Roto Inject Fluid', code: 'OIL-ATLAS-ROTO', unit: 'thùng', stockQuantity: 15, minQuantity: 5, description: 'Dầu chuyên dụng cho máy nén khí Atlas Copco (20L)' },
  })
  const part5 = await prisma.part.upsert({
    where: { code: 'PLC-S7-1200' }, update: { name: 'Bộ điều khiển PLC Siemens S7-1200', description: 'Bộ PLC điều khiển trung tâm tự động hoá' },
    create: { name: 'Bộ điều khiển PLC Siemens S7-1200', code: 'PLC-S7-1200', unit: 'bộ', stockQuantity: 4, minQuantity: 1, description: 'Bộ PLC điều khiển trung tâm tự động hoá' },
  })
  const part6 = await prisma.part.upsert({
    where: { code: 'VFD-DELTA-M' }, update: { name: 'Biến tần Delta VFD-M 5.5kW', description: 'Biến tần điều khiển tốc độ motor băng chuyền' },
    create: { name: 'Biến tần Delta VFD-M 5.5kW', code: 'VFD-DELTA-M', unit: 'cái', stockQuantity: 6, minQuantity: 2, description: 'Biến tần điều khiển tốc độ motor băng chuyền' },
  })
  console.log('✅ Parts: 6 linh kiện công nghiệp')

  // ==========================================
  // 8. PART IMPORTS
  // ==========================================
  const import1 = await prisma.partImport.upsert({
    where: { id: 1 }, update: {},
    create: { importedBy: adminUser.id, supplier: 'Công ty CP Tự động hoá Sài Gòn', importDate: new Date('2024-01-10'), totalCost: 125000000, note: 'Nhập Servo, Cảm biến, PLC dự phòng' },
  })
  await prisma.partImportDetail.upsert({ where: { id: 1 }, update: {}, create: { importId: import1.id, partId: part1.id, quantity: 4, unitPrice: 15000000 } })
  await prisma.partImportDetail.upsert({ where: { id: 2 }, update: {}, create: { importId: import1.id, partId: part2.id, quantity: 20, unitPrice: 850000 } })
  await prisma.partImportDetail.upsert({ where: { id: 3 }, update: {}, create: { importId: import1.id, partId: part5.id, quantity: 2, unitPrice: 24000000 } })

  const import2 = await prisma.partImport.upsert({
    where: { id: 2 }, update: {},
    create: { importedBy: adminUser.id, supplier: 'Đại lý vòng bi và Dầu nhờn', importDate: new Date('2024-03-05'), totalCost: 45000000, note: 'Nhập vật tư tiêu hao' },
  })
  await prisma.partImportDetail.upsert({ where: { id: 4 }, update: {}, create: { importId: import2.id, partId: part3.id, quantity: 50, unitPrice: 300000 } })
  await prisma.partImportDetail.upsert({ where: { id: 5 }, update: {}, create: { importId: import2.id, partId: part4.id, quantity: 10, unitPrice: 3000000 } })
  console.log('✅ Part Imports: 2 phiếu nhập, 5 chi tiết vật tư giá trị cao')

  // ==========================================
  // 9. TICKETS
  // ==========================================
  const ticket1 = await prisma.ticket.upsert({
    where: { id: 1 }, update: {},
    create: { deviceId: device1.id, title: 'Máy CNC báo lỗi Spindle Alarm', description: 'Trục chính không quay, màn hình điều khiển báo lỗi AL-12. Máy đang dừng sản xuất.', priority: 'high', status: 'processing' },
  })
  const ticket2 = await prisma.ticket.upsert({
    where: { id: 2 }, update: {},
    create: { deviceId: device3.id, title: 'Máy nén khí giảm áp suất', description: 'Áp suất tụt xuống 4 Bar, nhiệt độ buồng nén cao hơn mức bình thường.', priority: 'medium', status: 'pending' },
  })
  const ticket3 = await prisma.ticket.upsert({
    where: { id: 3 }, update: {},
    create: { deviceId: device5.id, title: 'Robot gắp hàng bị lệch toạ độ', description: 'Trục số 3 của Robot hoạt động không chính xác, gây rớt sản phẩm khỏi băng tải.', priority: 'high', status: 'pending' },
  })
  const ticket4 = await prisma.ticket.upsert({
    where: { id: 4 }, update: {},
    create: { deviceId: device2.id, title: 'Nhiễu tín hiệu điều khiển Robot', description: 'Cánh tay Robot KUKA đôi lúc bị dừng đột ngột, nghi do cáp Encoder bị lỏng.', priority: 'low', status: 'resolved' },
  })
  console.log('✅ Tickets: 4 sự cố thiết bị')

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
  console.log('✅ Maintenance Schedules: 3 lịch bảo dưỡng máy định kỳ')

  // ==========================================
  // 11. WORK ORDERS
  // ==========================================
  const wo1 = await prisma.workOrder.upsert({
    where: { id: 1 }, update: {},
    create: { ticketId: ticket1.id, technicianId: tech1.id, workDescription: 'Kiểm tra motor trục chính và vòng bi Spindle của máy CNC. Chuẩn bị thay thế.', status: 'processing', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  })
  const wo2 = await prisma.workOrder.upsert({
    where: { id: 2 }, update: {},
    create: { ticketId: ticket4.id, technicianId: tech2.id, workDescription: 'Thay thế dây cáp Encoder bị gập, chạy test tải 12h ổn định.', status: 'completed', startedAt: new Date('2025-04-20'), completedAt: new Date('2025-04-21') },
  })
  const wo3 = await prisma.workOrder.upsert({
    where: { id: 3 }, update: {},
    create: { maintenanceScheduleId: 3, technicianId: tech1.id, workDescription: 'Bảo trì tổng quát: Châm mỡ vòng bi, kiểm tra độ rơ cơ khí, dọn dẹp hệ thống làm mát tủ điện.', status: 'completed', startedAt: new Date('2025-01-15'), completedAt: new Date('2025-01-15') },
  })
  console.log('✅ Work Orders: 3 phiếu lệnh công việc')

  // ==========================================
  // 12. PART USAGES
  // ==========================================
  await prisma.partUsage.upsert({ where: { id: 1 }, update: {}, create: { workOrderId: wo1.id, partId: part3.id, quantityUsage: 2 } })
  await prisma.partUsage.upsert({ where: { id: 2 }, update: {}, create: { workOrderId: wo3.id, partId: part4.id, quantityUsage: 1 } })
  console.log('✅ Part Usages: Ghi nhận linh kiện thay thế trên WO')

  // ==========================================
  // 13. PART EXPORTS
  // ==========================================
  const export1 = await prisma.partExport.upsert({
    where: { id: 1 }, update: { reason: 'Xuất kho Vòng bi để sửa chữa trục chính máy CNC' },
    create: { technicianId: tech1.id, exportDate: new Date('2025-04-20'), reason: 'Xuất kho Vòng bi để sửa chữa trục chính máy CNC', status: 'completed' },
  })
  await prisma.partExportDetail.upsert({ where: { id: 1 }, update: {}, create: { exportId: export1.id, partId: part3.id, quantity: 2 } })

  const export2 = await prisma.partExport.upsert({
    where: { id: 2 }, update: { reason: 'Xuất Dầu nén khí và Cảm biến đi bảo trì nhà máy 1' },
    create: { technicianId: tech1.id, exportDate: new Date('2025-01-15'), reason: 'Xuất Dầu nén khí và Cảm biến đi bảo trì nhà máy 1', status: 'completed' },
  })
  await prisma.partExportDetail.upsert({ where: { id: 2 }, update: {}, create: { exportId: export2.id, partId: part4.id, quantity: 1 } })
  await prisma.partExportDetail.upsert({ where: { id: 3 }, update: {}, create: { exportId: export2.id, partId: part2.id, quantity: 5 } })
  console.log('✅ Part Exports: 2 phiếu xuất kho')

  // ==========================================
  // TỔNG KẾT
  // ==========================================
  console.log('\n🎉 Seed data hoàn thành!')
  console.log('\n📋 ===== TÀI KHOẢN TEST =====')
  console.log('Admin     | admin       / admin123')
  console.log('KTV 1     | technician1 / tech123   (Kỹ sư Cơ điện tử)')
  console.log('KTV 2     | technician2 / tech123   (Kỹ sư Tự động hoá)')
  console.log('Khách 1   | customer1   / cust123   (Cơ khí Trí Việt)')
  console.log('Khách 2   | customer2   / cust123   (Ô tô Tân Phát)')
  console.log('Khách 3   | customer3   / cust123   (Thực phẩm Á Châu)')
  
  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('❌ Seed thất bại:', e)
  await prisma.$disconnect()
  process.exit(1)
})
