import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code - Digital Evaluation System',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #06b6d4;">Digital Evaluation System</h2>
        <p>Your OTP code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #020617; background-color: #f1f5f9; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
        <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
        <p>If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

export const sendReminderEmail = async (email, name, pendingCount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reminder: Pending Answer Scripts for Evaluation',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #06b6d4;">Digital Evaluation System</h2>
        <p>Dear ${name},</p>
        <p>This is a friendly reminder that you currently have <strong>${pendingCount}</strong> pending answer script(s) assigned for evaluation.</p>
        <p>Please log in to your dashboard to complete the evaluations.</p>
        <br/>
        <p>Thank you,</p>
        <p>Admin Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};
