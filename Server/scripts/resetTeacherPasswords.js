import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";

async function resetTeacherPasswords() {
  console.log("Starting Teacher Password Reset Script...");
  
  try {
    const teachers = await prisma.teacher.findMany();
    console.log(`Found ${teachers.length} teachers. Processing...`);

    let successCount = 0;
    let failedCount = 0;

    for (const teacher of teachers) {
      try {
        if (!teacher.email) {
          console.warn(`Teacher ID ${teacher.id} has no email, skipping.`);
          failedCount++;
          continue;
        }

        const username = teacher.email.split("@")[0];
        const rawPassword = `${username}@123`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { password: hashedPassword }
        });

        console.log(`Updated password for ${teacher.email} (New: ${rawPassword})`);
        successCount++;
      } catch (err) {
        console.error(`Failed to update password for ${teacher.email}:`, err);
        failedCount++;
      }
    }

    console.log("\n====================================================");
    console.log("PASSWORD RESET SUMMARY");
    console.log("====================================================");
    console.log(`Total Teachers Processed : ${teachers.length}`);
    console.log(`Successfully Updated     : ${successCount}`);
    console.log(`Failed Updates           : ${failedCount}`);
    console.log("====================================================\n");

  } catch (error) {
    console.error("Fatal error during password reset:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetTeacherPasswords();
