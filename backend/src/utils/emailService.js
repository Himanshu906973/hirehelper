const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, firstName) => {
  const mailOptions = {
    from: `"HireHelper" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your HireHelper Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0;">HireHelper</h2>
          <p style="color: #64748b; margin-top: 4px;">On-Demand Task Assistance</p>
        </div>
        <h3 style="color: #1e293b;">Hi ${firstName}!</h3>
        <p style="color: #475569;">Thanks for signing up. Please verify your email with the code below:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2563eb;">${otp}</span>
        </div>
        <p style="color: #475569; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you didn't create a HireHelper account, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
