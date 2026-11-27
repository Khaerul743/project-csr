import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";
import { AppLogger } from "@/common/logger/app-logger";

export interface SendOtpOptions {
  to: string;
  otp: string;
  recipientName?: string;
}

export interface SendPartnerInvitationOptions {
  to: string | string[];
  partnerName: string;
  companyName: string;
  programName: string;
  responseDeadlineText: string;
  appUrl?: string;
}

export interface SendPartnerInvitationOverdueOptions {
  to: string | string[];
  partnerName: string;
  companyName: string;
  programName: string;
  responseDeadlineText: string;
  customBodyText?: string | null;
}

export class EmailService {
  private readonly logger = new AppLogger("EmailService");
  private transporter: Transporter | null = null;
  private readonly isConfigured: boolean;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT?.trim() || "587", 10);
    const user = process.env.SMTP_USER?.trim();
    let pass = process.env.SMTP_PASSWORD?.trim();

    if (pass) {
      while ((pass.startsWith('"') && pass.endsWith('"')) || (pass.startsWith("'") && pass.endsWith("'"))) {
        pass = pass.slice(1, -1).trim();
      }
      if (host?.includes("gmail.com")) {
        pass = pass.replace(/\s+/g, "");
      }
    }

    this.isConfigured = Boolean(host && user && pass);

    if (this.isConfigured) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
        });
        this.logger.info(`SMTP Transporter initialized for ${host}:${port}`);
      } catch (err: unknown) {
        this.logger.error("Failed to initialize SMTP transporter, falling back to console", err);
        this.transporter = null;
      }
    } else {
      this.logger.info("SMTP credentials not provided in .env - running in Console Development Mode");
    }
  }

  /**
   * Mengirimkan email kode verifikasi OTP 6 digit.
   * Jika kredensial SMTP belum disetel, kode OTP akan otomatis dicetak ke console terminal.
   */
  async sendOtpEmail(options: SendOtpOptions): Promise<boolean> {
    const { to, otp, recipientName } = options;
    const name = recipientName ? recipientName.trim() : "Pengguna";

    // 1. Fallback mode: cetak ke console jika SMTP belum disetel
    if (!this.isConfigured || !this.transporter) {
      this.printConsoleOtpBox(to, otp, name);
      return true;
    }

    // 2. Real SMTP sending mode
    try {
      const from = process.env.SMTP_FROM || `"SIPENA CSR Platform" <${process.env.SMTP_USER}>`;
      const subject = `${otp} adalah Kode Verifikasi OTP Anda di SIPENA`;

      await this.transporter.sendMail({
        from,
        to,
        subject,
        text: `Halo ${name},\n\nKode OTP verifikasi akun SIPENA Anda adalah: ${otp}\nKode ini berlaku selama 10 menit.\nJangan berikan kode ini kepada siapapun.\n\nSalam,\nTim SIPENA`,
        html: this.generateOtpHtml(name, otp),
      });

      this.logger.info(`Verification OTP email successfully sent via SMTP to: ${to}`);
      return true;
    } catch (err: unknown) {
      this.logger.error(`Failed to send OTP email via SMTP to ${to}, printing to console as safety fallback`, err);
      // Tetap cetak ke console agar alur verifikasi tidak macet jika koneksi SMTP bermasalah
      this.printConsoleOtpBox(to, otp, name);
      return false;
    }
  }

  /**
   * Mengirimkan email notifikasi undangan kolaborasi CSR kepada mitra.
   * Jika kredensial SMTP belum disetel, ringkasan email dicetak ke console terminal.
   */
  async sendPartnerInvitationEmail(
    options: SendPartnerInvitationOptions
  ): Promise<boolean> {
    const {
      to,
      partnerName,
      companyName,
      programName,
      responseDeadlineText,
      appUrl,
    } = options;

    const recipients = Array.isArray(to) ? to.join(", ") : to;
    if (!recipients) {
      this.logger.warn("Skipped partner invitation email: no recipient email address found");
      return false;
    }

    const loginUrl = `${(appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "")}/login`;

    const plainText = [
      `Yth. Bapak/Ibu Pengurus ${partnerName},`,
      "",
      `Terdapat undangan kolaborasi baru dari ${companyName} untuk program CSR "${programName}" yang ditujukan kepada organisasi Bapak/Ibu.`,
      "",
      `Mohon periksa detail undangan dan berikan tanggapan sebelum batas waktu yang ditentukan, yaitu ${responseDeadlineText}.`,
      "",
      "Silakan masuk ke SIPENA untuk melihat dan meninjau undangan tersebut:",
      loginUrl,
      "",
      "Terima kasih.",
      "",
      "Tim SIPENA",
      "Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR",
    ].join("\n");

    if (!this.isConfigured || !this.transporter) {
      this.printConsoleInvitationBox(
        recipients,
        partnerName,
        companyName,
        programName,
        responseDeadlineText
      );
      return true;
    }

    try {
      const from = process.env.SMTP_FROM || `"SIPENA CSR Platform" <${process.env.SMTP_USER}>`;
      const subject = `Undangan Kolaborasi Baru: ${programName} dari ${companyName} - SIPENA`;

      await this.transporter.sendMail({
        from,
        to: recipients,
        subject,
        text: plainText,
        html: this.generatePartnerInvitationHtml({
          partnerName,
          companyName,
          programName,
          responseDeadlineText,
          loginUrl,
        }),
      });

      this.logger.info(
        `Partner invitation notification email sent via SMTP to: ${recipients}`
      );
      return true;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send partner invitation email via SMTP to ${recipients}`,
        err
      );
      this.printConsoleInvitationBox(
        recipients,
        partnerName,
        companyName,
        programName,
        responseDeadlineText
      );
      return false;
    }
  }

  /**
   * Mengirimkan email pemberitahuan kepada mitra ketika undangan kolaborasi
   * melewati batas waktu tanggapan (Overdue) dan dibatalkan otomatis oleh sistem.
   */
  async sendPartnerInvitationOverdueEmail(
    options: SendPartnerInvitationOverdueOptions
  ): Promise<boolean> {
    const {
      to,
      partnerName,
      companyName,
      programName,
      responseDeadlineText,
      customBodyText,
    } = options;

    const recipients = Array.isArray(to) ? to.join(", ") : to;
    if (!recipients) {
      this.logger.warn(
        "Skipped overdue invitation email: no recipient email address found"
      );
      return false;
    }

    const defaultPlainText = [
      `Yth. Bapak/Ibu Pengurus ${partnerName},`,
      "",
      "Salam sejahtera,",
      "",
      `Kami dari ${companyName} ingin menginformasikan bahwa undangan kolaborasi untuk program CSR "${programName}" telah melewati batas waktu tanggapan yang ditentukan, yaitu ${responseDeadlineText}.`,
      "",
      "Hingga batas waktu tersebut, kami belum menerima tanggapan dari Bapak/Ibu. Dengan demikian, kami memutuskan untuk membatalkan undangan kolaborasi ini.",
      "",
      "Kami mohon maaf apabila keputusan ini menimbulkan ketidaknyamanan. Terima kasih atas perhatian dan kesempatan yang telah diberikan. Kami berharap dapat menjalin kerja sama dengan Bapak/Ibu pada kesempatan lainnya.",
      "",
      "Hormat kami,",
      companyName,
    ].join("\n");

    const plainText =
      customBodyText && customBodyText.trim()
        ? customBodyText.trim()
        : defaultPlainText;

    if (!this.isConfigured || !this.transporter) {
      this.printConsoleOverdueBox(
        recipients,
        partnerName,
        companyName,
        programName,
        responseDeadlineText
      );
      return true;
    }

    try {
      const from =
        process.env.SMTP_FROM || `"SIPENA CSR Platform" <${process.env.SMTP_USER}>`;
      const subject = `Pemberitahuan Batas Waktu Undangan Kolaborasi: ${programName} - ${companyName}`;

      await this.transporter.sendMail({
        from,
        to: recipients,
        subject,
        text: plainText,
        html:
          customBodyText && customBodyText.trim()
            ? this.generateCustomOverdueHtml(customBodyText.trim())
            : this.generatePartnerOverdueHtml({
                partnerName,
                companyName,
                programName,
                responseDeadlineText,
              }),
      });

      this.logger.info(
        `Partner invitation overdue email sent via SMTP to: ${recipients}`
      );
      return true;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send partner overdue email via SMTP to ${recipients}`,
        err
      );
      this.printConsoleOverdueBox(
        recipients,
        partnerName,
        companyName,
        programName,
        responseDeadlineText
      );
      return false;
    }
  }

  private printConsoleOverdueBox(
    to: string,
    partnerName: string,
    companyName: string,
    programName: string,
    responseDeadlineText: string
  ): void {
    const divider = "=".repeat(60);
    console.log(`\n${divider}`);
    console.log(`⏰ [SIPENA EMAIL SERVICE - UNDANGAN OVERDUE]`);
    console.log(`📬 Kepada       : ${to} (${partnerName})`);
    console.log(`🏢 Perusahaan   : ${companyName}`);
    console.log(`📌 Program CSR  : ${programName}`);
    console.log(`📅 Batas Lewat  : ${responseDeadlineText}`);
    console.log(`${divider}\n`);
  }

  private generateCustomOverdueHtml(bodyText: string): string {
    const paragraphsHtml = bodyText
      .split(/\n{2,}/)
      .map((para) => {
        const safeLines = this.escapeHtml(para.trim()).replace(/\n/g, "<br>");
        return `<p style="margin: 0 0 14px 0; color: #47464F;">${safeLines}</p>`;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pemberitahuan Undangan Kolaborasi - SIPENA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E8E8EA; box-shadow: 0 4px 16px rgba(24, 19, 67, 0.05); overflow: hidden;">
                <tr>
                  <td style="padding: 28px 32px 22px 32px; text-align: center; background-color: #181343;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SIPENA</h1>
                    <p style="margin: 4px 0 0 0; color: #A09CB8; font-size: 12px; font-weight: 500;">Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px; color: #1A1C1D; font-size: 14px; line-height: 1.65;">
                    ${paragraphsHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 32px; background-color: #FAFAFB; border-top: 1px solid #F0F0F2; text-align: center;">
                    <p style="margin: 0; color: #9C9AA6; font-size: 11px;">
                      &copy; ${new Date().getFullYear()} SIPENA Platform CSR Indonesia. Email ini dikirim secara otomatis oleh sistem.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private generatePartnerOverdueHtml(params: {
    partnerName: string;
    companyName: string;
    programName: string;
    responseDeadlineText: string;
  }): string {
    const partnerName = this.escapeHtml(params.partnerName);
    const companyName = this.escapeHtml(params.companyName);
    const programName = this.escapeHtml(params.programName);
    const responseDeadlineText = this.escapeHtml(params.responseDeadlineText);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pemberitahuan Undangan Kolaborasi - SIPENA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E8E8EA; box-shadow: 0 4px 16px rgba(24, 19, 67, 0.05); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 28px 32px 22px 32px; text-align: center; background-color: #181343;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SIPENA</h1>
                    <p style="margin: 4px 0 0 0; color: #A09CB8; font-size: 12px; font-weight: 500;">Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px; color: #1A1C1D; font-size: 14px; line-height: 1.65;">
                    <p style="margin: 0 0 14px 0; font-weight: 600; color: #181343;">
                      Yth. Bapak/Ibu Pengurus ${partnerName},
                    </p>

                    <p style="margin: 0 0 16px 0; color: #47464F;">
                      Salam sejahtera,
                    </p>

                    <p style="margin: 0 0 16px 0; color: #47464F;">
                      Kami dari <strong style="color: #181343;">${companyName}</strong> ingin menginformasikan bahwa undangan kolaborasi untuk program CSR <strong style="color: #181343;">&ldquo;${programName}&rdquo;</strong> telah melewati batas waktu tanggapan yang ditentukan, yaitu <strong style="color: #B91C1C;">${responseDeadlineText}</strong>.
                    </p>

                    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-left: 4px solid #DC2626; border-radius: 10px; padding: 14px 16px; margin: 18px 0;">
                      <p style="margin: 0; color: #7F1D1D; font-size: 13px;">
                        Hingga batas waktu tersebut, kami belum menerima tanggapan dari Bapak/Ibu. Dengan demikian, kami memutuskan untuk membatalkan undangan kolaborasi ini.
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #47464F;">
                      Kami mohon maaf apabila keputusan ini menimbulkan ketidaknyamanan. Terima kasih atas perhatian dan kesempatan yang telah diberikan. Kami berharap dapat menjalin kerja sama dengan Bapak/Ibu pada kesempatan lainnya.
                    </p>

                    <div style="border-top: 1px solid #F0F0F2; padding-top: 16px; margin-top: 20px;">
                      <p style="margin: 0; color: #47464F; font-size: 13px;">Hormat kami,</p>
                      <p style="margin: 4px 0 0 0; font-weight: 700; color: #181343; font-size: 14px;">${companyName}</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 18px 32px; background-color: #FAFAFB; border-top: 1px solid #F0F0F2; text-align: center;">
                    <p style="margin: 0; color: #9C9AA6; font-size: 11px;">
                      &copy; ${new Date().getFullYear()} SIPENA Platform CSR Indonesia. Email ini dikirim secara otomatis oleh sistem.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private printConsoleInvitationBox(
    to: string,
    partnerName: string,
    companyName: string,
    programName: string,
    responseDeadlineText: string
  ): void {
    const divider = "=".repeat(60);
    console.log(`\n${divider}`);
    console.log(`📧 [SIPENA EMAIL SERVICE - UNDANGAN MITRA]`);
    console.log(`📬 Kepada       : ${to} (${partnerName})`);
    console.log(`🏢 Perusahaan   : ${companyName}`);
    console.log(`📌 Program CSR  : ${programName}`);
    console.log(`⏳ Batas Respon : ${responseDeadlineText}`);
    console.log(`${divider}\n`);
  }

  private generatePartnerInvitationHtml(params: {
    partnerName: string;
    companyName: string;
    programName: string;
    responseDeadlineText: string;
    loginUrl: string;
  }): string {
    const partnerName = this.escapeHtml(params.partnerName);
    const companyName = this.escapeHtml(params.companyName);
    const programName = this.escapeHtml(params.programName);
    const responseDeadlineText = this.escapeHtml(params.responseDeadlineText);
    const loginUrl = this.escapeHtml(params.loginUrl);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Undangan Kolaborasi Baru - SIPENA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E8E8EA; box-shadow: 0 4px 16px rgba(24, 19, 67, 0.05); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 28px 32px 22px 32px; text-align: center; background-color: #181343;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SIPENA</h1>
                    <p style="margin: 4px 0 0 0; color: #A09CB8; font-size: 12px; font-weight: 500;">Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px; color: #1A1C1D; font-size: 14px; line-height: 1.65;">
                    <p style="margin: 0 0 16px 0; font-weight: 600; color: #181343;">
                      Yth. Bapak/Ibu Pengurus ${partnerName},
                    </p>

                    <p style="margin: 0 0 16px 0; color: #47464F;">
                      Terdapat undangan kolaborasi baru dari <strong style="color: #181343;">${companyName}</strong> untuk program CSR <strong style="color: #181343;">&ldquo;${programName}&rdquo;</strong> yang ditujukan kepada organisasi Bapak/Ibu.
                    </p>

                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #059669; border-radius: 10px; padding: 14px 16px; margin: 20px 0;">
                      <p style="margin: 0; color: #47464F; font-size: 13px;">
                        Mohon periksa detail undangan dan berikan tanggapan sebelum batas waktu yang ditentukan, yaitu <strong style="color: #181343;">${responseDeadlineText}</strong>.
                      </p>
                    </div>

                    <p style="margin: 0 0 22px 0; color: #47464F;">
                      Silakan masuk ke SIPENA untuk melihat dan meninjau undangan tersebut.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 26px 0;">
                      <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #059669; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px;">
                        Masuk ke SIPENA
                      </a>
                    </div>

                    <p style="margin: 24px 0 16px 0; color: #47464F;">
                      Terima kasih.
                    </p>

                    <div style="border-top: 1px solid #F0F0F2; padding-top: 16px; margin-top: 20px;">
                      <p style="margin: 0; font-weight: 700; color: #181343; font-size: 13px;">Tim SIPENA</p>
                      <p style="margin: 2px 0 0 0; color: #787680; font-size: 12px;">Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 18px 32px; background-color: #FAFAFB; border-top: 1px solid #F0F0F2; text-align: center;">
                    <p style="margin: 0; color: #9C9AA6; font-size: 11px;">
                      &copy; ${new Date().getFullYear()} SIPENA Platform CSR Indonesia. Email ini dikirim secara otomatis oleh sistem.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private printConsoleOtpBox(to: string, otp: string, name: string): void {
    const divider = "=".repeat(60);
    console.log(`\n${divider}`);
    console.log(`🚀 [SIPENA EMAIL SERVICE - DEVELOPMENT MODE]`);
    console.log(`📬 Kepada : ${to} (${name})`);
    console.log(`🔑 Kode OTP : >>>  ${otp}  <<<`);
    console.log(`⏳ Masa Berlaku : 10 Menit`);
    console.log(`ℹ️  Info : Masukkan 6 angka di atas pada halaman verifikasi email.`);
    console.log(`${divider}\n`);
  }

  private generateOtpHtml(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikasi Email SIPENA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E8E8EA; box-shadow: 0 4px 16px rgba(24, 19, 67, 0.05); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 20px 32px; text-align: center; background-color: #181343;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SIPENA</h1>
                    <p style="margin: 4px 0 0 0; color: #A09CB8; font-size: 12px; font-weight: 500;">Sistem Pengelolaan Ekosistem & Kemitraan CSR</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin: 0 0 12px 0; color: #181343; font-size: 18px; font-weight: 700;">Verifikasi Alamat Email Anda</h2>
                    <p style="margin: 0 0 24px 0; color: #5B5966; font-size: 14px; line-height: 1.6;">
                      Halo <strong>${name}</strong>,<br>
                      Terima kasih telah mendaftar di platform SIPENA. Untuk menyelesaikan pendaftaran dan mengaktifkan akun Anda, silakan gunakan kode OTP 6 digit berikut:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #F8F9FA; border: 2px dashed #181343; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #181343;">${otp}</span>
                      <p style="margin: 8px 0 0 0; color: #787680; font-size: 12px;">Kode ini berlaku selama <strong>10 menit</strong></p>
                    </div>

                    <p style="margin: 0 0 16px 0; color: #787680; font-size: 12px; line-height: 1.5;">
                      Demi keamanan akun Anda, jangan berikan kode verifikasi ini kepada siapa pun termasuk pihak yang mengatasnamakan SIPENA.
                    </p>

                    <p style="margin: 24px 0 0 0; color: #5B5966; font-size: 13px;">
                      Jika Anda tidak pernah mendaftarkan akun di SIPENA, Anda dapat mengabaikan email ini dengan aman.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #FAFAFB; border-top: 1px solid #F0F0F2; text-align: center;">
                    <p style="margin: 0; color: #9C9AA6; font-size: 11px;">
                      &copy; ${new Date().getFullYear()} SIPENA Platform CSR Indonesia. Hak Cipta Dilindungi.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
