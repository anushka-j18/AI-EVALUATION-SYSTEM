import cron from 'node-cron';
import AnswerSheet from '../models/AnswerSheet.js';
import { sendReminderEmail } from './emailService.js';

// Run the job every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily cron job for pending evaluations...');
  try {
    const pendingScripts = await AnswerSheet.find({
      status: { $in: ['assigned', 'pending'] },
      assignedTo: { $ne: null },
    }).populate('assignedTo');

    const currentDate = new Date();
    // Group pending scripts by teacher ID if they match the 5-day rule
    const teacherPendingCounts = {};
    const teacherDetails = {};

    pendingScripts.forEach(script => {
      if (!script.assignedAt) return; // Skip if no assigned date

      const assignedDate = new Date(script.assignedAt);
      const diffTime = Math.abs(currentDate - assignedDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Check if it's been exactly 5, 10, 15, etc. days
      if (diffDays > 0 && diffDays % 5 === 0) {
        const tId = script.assignedTo._id.toString();
        if (!teacherPendingCounts[tId]) {
          teacherPendingCounts[tId] = 0;
          teacherDetails[tId] = script.assignedTo;
        }
        teacherPendingCounts[tId]++;
      }
    });

    // Send emails
    for (const tId in teacherPendingCounts) {
      const teacher = teacherDetails[tId];
      const count = teacherPendingCounts[tId];
      
      if (teacher && teacher.email && teacher.isActive) {
        console.log(`Sending reminder to ${teacher.email} for ${count} pending script(s).`);
        await sendReminderEmail(teacher.email, teacher.name, count);
      }
    }
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});
