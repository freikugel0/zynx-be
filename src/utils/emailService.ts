// src/utils/emailService.ts
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `http://localhost:8081/api/v1/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const mailOptions = {
    from: `"Digital Business Card App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Digital Business Card account",
    html: `
      <h2>Welcome to Digital Business Cardd 👋</h2>
      <p>Click the button below to verify your account:</p>
      <a href="${verifyUrl}" 
         style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Verify Email
      </a>
      <p>Or copy and paste this link manually:</p>
      <p>${verifyUrl}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
