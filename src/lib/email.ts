import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
  cid?: string;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  sent: boolean;
  provider: "smtp" | "resend" | "none";
  messageId?: string;
  error?: string;
}

export function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function getEmailConfiguration() {
  let setting: any = null;
  try {
    setting = await prisma.storeSetting.findUnique({ where: { id: "default" } });
  } catch {
    // ignore db lookup fallback
  }

  const smtpHost =
    setting?.smtpHost?.trim() || process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const smtpPort = Number(setting?.smtpPort || process.env.SMTP_PORT || 587);
  const smtpUser = setting?.smtpUser?.trim() || process.env.SMTP_USER?.trim() || "";
  const rawPass = setting?.smtpPass?.trim() || process.env.SMTP_PASS?.trim() || "";
  const smtpPass = smtpHost.toLowerCase().includes("gmail")
    ? rawPass.replace(/\s+/g, "")
    : rawPass;
  const resendApiKey =
    setting?.resendApiKey?.trim() || process.env.RESEND_API_KEY?.trim() || "";
  const adminNotificationEmail =
    setting?.adminNotificationEmail?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    "jaidav.enggineernes@gmail.com";
  const emailFrom =
    setting?.emailFrom?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    (smtpUser ? `JNshop <${smtpUser}>` : "JNshop <orders@jnshop.com>");

  return {
    smtpHost,
    smtpPort: Number.isFinite(smtpPort) && smtpPort > 0 ? smtpPort : 587,
    smtpUser,
    smtpPass,
    resendApiKey,
    adminNotificationEmail,
    emailFrom,
    hasSmtp: Boolean(smtpUser && smtpPass),
    hasResend: Boolean(resendApiKey),
  };
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const cfg = await getEmailConfiguration();
  const recipients = Array.isArray(input.to) ? input.to.filter(Boolean) : [input.to].filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, provider: "none", error: "Alamat email tujuan kosong." };
  }

  // 1. Prefer SMTP (e.g. Gmail App Password or custom SMTP server)
  if (cfg.hasSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: cfg.smtpHost,
        port: cfg.smtpPort,
        secure: cfg.smtpPort === 465,
        auth: {
          user: cfg.smtpUser,
          pass: cfg.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: cfg.emailFrom,
        to: recipients.join(", "),
        replyTo: input.replyTo || cfg.adminNotificationEmail,
        subject: input.subject,
        text: input.text,
        html: input.html,
        attachments: input.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          cid: att.cid,
        })),
      });

      return {
        sent: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error("SMTP email delivery failed:", err);
      // Fall through to Resend if configured, otherwise report error
      if (!cfg.hasResend) {
        return {
          sent: false,
          provider: "smtp",
          error: err?.message || "Gagal mengirim email melalui SMTP.",
        };
      }
    }
  }

  // 2. Fallback or primary Resend HTTP API
  if (cfg.hasResend) {
    try {
      const payload: Record<string, any> = {
        from: cfg.emailFrom,
        to: recipients,
        subject: input.subject,
        html: input.html,
      };
      if (input.text) payload.text = input.text;
      if (input.replyTo) payload.reply_to = input.replyTo;
      if (input.attachments && input.attachments.length > 0) {
        payload.attachments = input.attachments.map((att) => ({
          filename: att.filename,
          content: att.content.toString("base64"),
          content_type: att.contentType || "application/octet-stream",
        }));
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          sent: false,
          provider: "resend",
          error: data?.message || data?.error || "Gagal mengirim email melalui Resend.",
        };
      }

      return {
        sent: true,
        provider: "resend",
        messageId: data?.id,
      };
    } catch (err: any) {
      console.error("Resend email delivery failed:", err);
      return {
        sent: false,
        provider: "resend",
        error: err?.message || "Gagal menghubungi layanan Resend.",
      };
    }
  }

  return {
    sent: false,
    provider: "none",
    error: "Konfigurasi SMTP Email / Resend belum diatur. Atur di menu Admin > Pengaturan > Email & Notifikasi QRIS.",
  };
}
