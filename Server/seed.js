import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';

async function main() {
  const salt = await bcrypt.genSalt(10);
  
  // Seed admin
  const adminPassword = await bcrypt.hash('admin@123', salt);
  await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
    },
  });
  
  // Seed teacher
  const teacherPassword = await bcrypt.hash('teacher@1234', salt);
  await prisma.teacher.upsert({
    where: { email: 'teacher@gmail.com' },
    update: {},
    create: {
      name: 'Test Teacher',
      email: 'teacher@gmail.com',
      password: teacherPassword,
      department: 'CS',
      employeeId: 'EMP001',
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
