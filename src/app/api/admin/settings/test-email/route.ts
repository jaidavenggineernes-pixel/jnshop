import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdminUser } from "@/lib/auth";
import { getEmailConfiguration, sendTransactionalEmail, escapeHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => ({}));

    const saved = await getEmailConfiguration();

    const adminNotificationEmail =
      String(body.adminNotificationEmail ?? saved.adminNotificationEmail).trim() ||
      saved.adminNotificationEmail;
    const smtpHost = String(body.smtpHost ?? saved.smtpHost ?? "smtp.gmail.com").trim();
    const smtpPort = Number.parseInt(String(body.smtpPort ?? saved.smtpPort ?? 587), 10) || 587;
    const smtpUser = String(body.smtpUser ?? saved.smtpUser ?? "").trim();
    const rawSmtpPass = String(body.smtpPass ?? saved.smtpPass ?? "").trim();
    const smtpPass = smtpHost.toLowerCase().includes("gmail")
      ? rawSmtpPass.replace(/\s+/g, "")
      : rawSmtpPass;
    const resendApiKey = String(body.resendApiKey ?? saved.resendApiKey ?? "").trim();
    const emailFrom =
      String(body.emailFrom ?? saved.emailFrom).trim() || smtpUser || "orders@jnshop.com";
    const targetEmail = String(body.targetEmail ?? adminNotificationEmail).trim();

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json(
        { error: "Alamat email tujuan uji coba tidak valid." },
        { status: 400 }
      );
    }

    const subject = "[JNshop] Uji Koneksi Email Notifikasi & QRIS Berhasil";
    const text = [
      "Halo Admin JNshop,",
      "",
      "Ini adalah email uji coba dari pengaturan JNshop.",
      `Email Admin Penerima Notifikasi QRIS: ${adminNotificationEmail}`,
      `Alamat Pengirim: ${emailFrom}`,
      "",
      "Jika Anda menerima pesan ini, sistem siap mengirim notifikasi pesanan QRIS baru ke admin dan mengirim gambar QRIS langsung ke email pelanggan.",
    ].join("\n");
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:12px;color:#18181b;">
        <h2 style="margin:0 0 8px 0;color:#166534;">Koneksi Email JNshop Aktif</h2>
        <p style="margin:0 0 12px 0;font-size:14px;color:#3f3f46;">
          Email notifikasi otomatis pesanan QRIS baru dan pengiriman kode QRIS ke pelanggan telah terkonfigurasi.
        </p>
        <div style="background:#f4f4f5;padding:12px 14px;border-radius:8px;font-size:13px;">
          <div><strong>Tujuan Admin QRIS:</strong> ${escapeHtml(adminNotificationEmail)}</div>
          <div><strong>Alamat Pengirim:</strong> ${escapeHtml(emailFrom)}</div>
        </div>
      </div>
    `;

    // Test direct SMTP override if credentials were supplied in the request body
    if (smtpHost && smtpUser && smtpPass) {
      if (smtpHost.toLowerCase().includes("gmail") && !smtpUser.includes("@")) {
        return NextResponse.json(
          {
            error:
              'SMTP Username untuk Gmail harus berupa alamat email penuh (contoh: "jaidav.enggineernes@gmail.com"), bukan nama aplikasi seperti "JNShop".',
          },
          { status: 400 }
        );
      }
      const started = Date.now();
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.verify();
      const info = await transporter.sendMail({
        from: emailFrom.includes("<") ? emailFrom : `JNshop Store <${smtpUser}>`,
        to: targetEmail,
        subject,
        text,
        html,
      });

      return NextResponse.json({
        success: true,
        provider: "smtp",
        targetEmail,
        latencyMs: Date.now() - started,
        message: `Email uji coba berhasil dikirim via SMTP (${smtpHost}) ke ${targetEmail}.`,
        messageId: info.messageId,
      });
    }

    // Test direct Resend override if provided
    if (resendApiKey) {
      const started = Date.now();
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [targetEmail],
          subject,
          text,
          html,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.message || `Resend error (${res.status})` },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        provider: "resend",
        targetEmail,
        latencyMs: Date.now() - started,
        message: `Email uji coba berhasil dikirim via Resend ke ${targetEmail}.`,
        messageId: data?.id,
      });
    }

    // Fallback to saved config via shared dispatcher
    const result = await sendTransactionalEmail({
      to: targetEmail,
      subject,
      text,
      html,
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          error:
            result.error ||
            "SMTP atau Resend API Key belum diisi. Isi Gmail & App Password SMTP atau Resend API Key terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      targetEmail,
      message: `Email uji coba berhasil dikirim via ${result.provider.toUpperCase()} ke ${targetEmail}.`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Gagal mengirim email uji coba. Pastikan SMTP Host, Email Pengirim, dan App Password benar.",
      },
      { status: 400 }
    );
  }
}
