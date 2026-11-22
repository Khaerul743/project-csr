import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";
import { AppLogger } from "@/common/logger/app-logger";

export interface SendOtpOptions {
  to: string;
  otp: string;
  recipientName?: string;
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
