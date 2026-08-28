import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    const count = await prisma.staff.count();
    console.log('Staff count:', count);
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
    console.log('Recent staff:', staff.map(s => s.name));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
