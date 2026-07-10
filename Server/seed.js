import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import Teacher from './models/Teacher.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  const salt = await bcrypt.genSalt(10);
  
  // Seed admin
  const adminPassword = await bcrypt.hash('admin@123', salt);
  await Admin.findOneAndUpdate(
    { email: 'admin@gmail.com' },
    {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
    },
    { upsert: true, new: true }
  );
  console.log('Admin seeded: admin@gmail.com / admin@123');
  
  // Seed teacher
  const teacherPassword = await bcrypt.hash('teacher@1234', salt);
  await Teacher.findOneAndUpdate(
    { email: 'teacher@gmail.com' },
    {
      name: 'Test Teacher',
      email: 'teacher@gmail.com',
      password: teacherPassword,
      department: 'CS',
      employeeId: 'EMP001',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log('Teacher seeded: teacher@gmail.com / teacher@1234');

  console.log('Seed completed successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => mongoose.disconnect());
