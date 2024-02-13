import { dev } from "$app/environment";
import nodemailer from "nodemailer";

const account = await nodemailer.createTestAccount();
export const transporter = nodemailer.createTransport({
  host: account.smtp.host,
  port: account.smtp.port,
  secure: account.smtp.secure,
  auth: {
    user: account.user,
    pass: account.pass,
  },
});

interface VerificationEmail {
  messageId: string;
  previewUrl?: string;
}

export async function sendEmailVerificationEmail(
  email: string,
  token: string
): Promise<VerificationEmail> {
  try {
    const mail = await transporter.sendMail({
      from: "Sender Name <sender@example.com>",
      to: email,
      subject: "Verify email",
      html: `<p><b>Hello</b> to myself!</p><a href="http://127.0.0.1:5173/verify/${token}">Verify</a>`,
    });

    if (dev) {
      const previewUrl = nodemailer.getTestMessageUrl(mail);
      if (typeof previewUrl === "string")
        return {
          messageId: mail.messageId,
          previewUrl: previewUrl,
        };
    }
    return {
      messageId: mail.messageId,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.error("at sendEmailVerificationEmail", e.message);
      throw e;
    }
  }
}

export async function sendEmailPasswordReset(email: string, token: string) {
  try {
    const mail = await transporter.sendMail({
      from: "Sender Name <sender@example.com>",
      to: email,
      subject: "Reset password",
      html: `<p><b>Hello</b> to myself!</p><a href="http://localhost:5173/reset-password/${token}">Set new password</a>`,
    });

    if (dev) {
      const previewUrl = nodemailer.getTestMessageUrl(mail);
      if (typeof previewUrl === "string")
        return {
          messageId: mail.messageId,
          previewUrl: previewUrl,
        };
    }
    return {
      messageId: mail.messageId,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.error("at sendEmailVerificationEmail", e.message);
      throw e;
    }
  }
}
