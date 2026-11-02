import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER || "ysportfolio143@gmail.com";
const emailPass = process.env.EMAIL_PASS || "zfkc bura wook vijq";

// Create reusable transporter object using SMTP transport
export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass.replace(/\s+/g, ""), // Strip spaces if any
  },
});

export async function sendOtpEmail(toEmail: string, otp: string, fullName?: string) {
  const mailOptions = {
    from: `"YS Portfolio Auth" <${emailUser}>`,
    to: toEmail,
    subject: `${otp} is your YS Portfolio Verification OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">YS PORTFOLIO</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Institutional Wealth & Portfolio Intelligence</p>
        </div>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px dashed #cbd5e1;">
          <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">
            ${fullName ? `Hello <strong>${fullName}</strong>,<br/>` : ""}Your One-Time Password (OTP) for Account Signup is:
          </p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0047AB; margin: 10px 0;">
            ${otp}
          </div>
          <p style="color: #ef4444; font-size: 12px; font-weight: 600; margin: 8px 0 0 0;">
            ⏱ This OTP is valid for 5 minutes.
          </p>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
          If you did not request this OTP, please ignore this email or contact support immediately. Never share your OTP with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} YS Portfolio (ARN 145084). All rights reserved.
        </p>
      </div>
    `,
  };

  return mailTransporter.sendMail(mailOptions);
}

// Notify admin (ysportfolio143@gmail.com) when a new user registers
export async function sendAdminNewUserAlert(
  username: string,
  plainPassword: string,
  fullName?: string,
  dob?: string
) {
  const mailOptions = {
    from: `"YS Portfolio System" <${emailUser}>`,
    to: emailUser, // Send directly to ysportfolio143@gmail.com
    subject: `🚨 New User Registered: ${fullName ? `${fullName} (${username})` : username}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0047AB; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">YS PORTFOLIO ADMIN ALERT</h2>
          <span style="background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px;">NEW REGISTRATION</span>
        </div>

        <p style="color: #334155; font-size: 14px; margin-bottom: 16px;">
          A new user has successfully registered and verified their account via OTP:
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${
              fullName
                ? `<tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Full Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${fullName}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Email / Username:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${username}</td>
            </tr>
            ${
              dob
                ? `<tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date of Birth:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${dob}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Password:</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 15px; color: #dc2626; font-weight: 700;">${plainPassword}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Registration Time:</td>
              <td style="padding: 8px 0; color: #0f172a;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
            </tr>
          </table>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
          This is an automated notification from the YS Portfolio authentication system.
        </p>
      </div>
    `,
  };

  return mailTransporter.sendMail(mailOptions);
}

// Send "Thank You for Registration" welcome email to the newly registered user
export async function sendWelcomeEmail(toEmail: string, fullName?: string) {
  const displayName = fullName || toEmail.split("@")[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ysportfolio.in";

  const mailOptions = {
    from: `"YS Portfolio" <${emailUser}>`,
    to: toEmail,
    subject: `🎉 Thank You for Registering with YS Portfolio!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 18px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #0047AB; padding-bottom: 16px;">
          <h2 style="color: #0047AB; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">YS PORTFOLIO</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Institutional Wealth & Digital Portfolio Intelligence (ARN 145084)</p>
        </div>

        <h3 style="color: #0f172a; font-size: 20px; margin: 0 0 12px 0;">
          Thank You for Your Registration, ${displayName}! 🎉
        </h3>

        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          Welcome to <strong>YS Portfolio</strong>! Your institutional investor account (<span style="color: #0047AB; font-weight: 600;">${toEmail}</span>) has been successfully verified and activated.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #0047AB; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #0f172a; font-size: 13px; font-weight: 700; margin: 0 0 8px 0;">What you can do next:</p>
          <ul style="color: #475569; font-size: 13px; line-height: 1.7; margin: 0; padding-left: 18px;">
            <li>Complete your KYC profile (PAN & Profile Picture).</li>
            <li>Track Direct Equities, Mutual Funds & Live AMFI NAVs.</li>
            <li>Monitor real-time Crude Oil, Commodities & FII/DII market flows.</li>
            <li>Connect with fellow traders in the Live Community Chat.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${siteUrl}/dashboard" style="background-color: #0047AB; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block;">
            Go to Your Portfolio Dashboard →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 22px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} YS Portfolio (ARN 145084). All rights reserved.
        </p>
      </div>
    `,
  };

  return mailTransporter.sendMail(mailOptions);
}
