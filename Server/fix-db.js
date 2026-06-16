import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';

async function fixDB() {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin@1234', salt);
    const teacherPassword = await bcrypt.hash('teacher@1234', salt);

    await prisma.admin.upsert({
      where: { email: 'admin@gmail.com' },
      update: { password: adminPassword },
      create: {
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: adminPassword,
      },
    });

    await prisma.teacher.upsert({
      where: { email: 'teacher@gmail.com' },
      update: { password: teacherPassword, isActive: true },
      create: {
        name: 'Test Teacher',
        email: 'teacher@gmail.com',
        password: teacherPassword,
        department: 'CS',
        employeeId: 'EMP001',
        isActive: true,
      },
    });

    console.log('Database fixed! Credentials should now work.');
  } catch (err) {
    console.error('Failed to fix database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixDB();
