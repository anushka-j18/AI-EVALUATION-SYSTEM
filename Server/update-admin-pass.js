import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash('admin@123', salt);
    
    await prisma.admin.upsert({
      where: { email: 'admin@gmail.com' },
      update: { password: newPassword },
      create: {
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: newPassword,
      },
    });
    
    console.log('Admin password updated to admin@123 successfully.');
  } catch (err) {
    console.error('Failed to update admin password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
