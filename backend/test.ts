import prisma from './src/config/database.js';
prisma.partExport.findMany({
  include: {
    technician: {
      select: {
        id: true,
        fullName: true,
        user: { select: { username: true } }
      }
    },
    details: { include: { part: true } }
  }
}).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error).finally(() => prisma.$disconnect());
