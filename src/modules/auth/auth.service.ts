import { randomInt } from "crypto";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { PasswordUtil } from "@/common/utils/password";
import { JwtService } from "@/common/jwt/jwt.service";
import { emailService } from "@/common/email/email.service";
import { AuthRepository } from "./auth.repository";
import {
  AuthResponseData,
  ChangePasswordDTO,
  LoginDTO,
  RegisterDTO,
  RegisterResponseData,
  ResendOtpDTO,
  SafeUser,
  UpdateProfileDTO,
  VerifyOtpDTO,
} from "./auth.interface";

export class AuthService {
  private readonly logger = new AppLogger("AuthService");

  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterDTO): Promise<RegisterResponseData> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedUsername = dto.username?.trim();
    this.logger.info(`Attempting to register user: ${normalizedEmail}`);

    // Check if email already registered
    const existing = await this.authRepository.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.emailVerifiedAt) {
        throw new ConflictError("Email sudah terdaftar");
      }

      // Jika user sudah terdaftar tapi belum verifikasi email, perbarui password dan buat OTP baru
      const hashedPassword = await PasswordUtil.hash(dto.password);
      await this.authRepository.updateUser(existing.id, {
        name: dto.name.trim(),
        username: normalizedUsername || existing.username,
        password: hashedPassword,
      });

      const otp = randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
      await this.authRepository.createOrUpdateOtp(normalizedEmail, otp, expiresAt);

      try {
        await emailService.sendOtpEmail({
          to: normalizedEmail,
          otp,
          recipientName: dto.name.trim(),
        });
      } catch (mailError) {
        this.logger.error(`Failed to send OTP email: ${mailError}`);
      }

      this.logger.info(`Unverified user re-registered, new OTP sent: ${existing.id} (${normalizedEmail})`);

      return {
        email: normalizedEmail,
        isVerified: false,
        message: "Kode OTP verifikasi baru telah dikirim ke email Anda",
      };
    }

    // Check if username already taken
    if (normalizedUsername) {
      const existingUsername = await this.authRepository.findByUsername(normalizedUsername);
      if (existingUsername) {
        throw new ConflictError("Nama pengguna sudah digunakan");
      }
    }

    // Hash the password
    const hashedPassword = await PasswordUtil.hash(dto.password);

    // Create user in database with INACTIVE status until email verified
    const createdUser = await this.authRepository.createUser({
      name: dto.name.trim(),
      username: normalizedUsername || null,
      email: normalizedEmail,
      password: hashedPassword,
      role: "STAGING",
      companyId: null,
      partnerId: null,
      status: "INACTIVE",
    });

    // Generate 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    await this.authRepository.createOrUpdateOtp(normalizedEmail, otp, expiresAt);

    // Send OTP email (or fallback to console)
    try {
      await emailService.sendOtpEmail({
        to: normalizedEmail,
        otp,
        recipientName: createdUser.name,
      });
    } catch (mailError) {
      this.logger.error(`Failed to send OTP email: ${mailError}`);
    }

    this.logger.info(`User registered successfully, OTP sent: ${createdUser.id} (${createdUser.email})`);

    return {
      email: normalizedEmail,
      isVerified: false,
      message: "Kode OTP verifikasi telah dikirim ke email Anda",
    };
  }

  async verifyOtp(dto: VerifyOtpDTO): Promise<AuthResponseData> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const cleanOtp = dto.otp.trim();
    this.logger.info(`Verifying OTP for: ${normalizedEmail}`);

    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundError("Akun pengguna tidak ditemukan");
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestError("Email ini sudah diverifikasi sebelumnya. Silakan langsung masuk.");
    }

    const verification = await this.authRepository.findLatestOtp(normalizedEmail);
    if (!verification) {
      throw new BadRequestError("Kode OTP tidak ditemukan atau telah kedaluwarsa. Silakan minta kode baru.");
    }

    // Check expiration
    if (new Date() > new Date(verification.expiresAt)) {
      await this.authRepository.deleteOtp(normalizedEmail);
      throw new BadRequestError("Kode OTP telah kedaluwarsa. Silakan minta kode baru.");
    }

    // Check attempts limit (max 5)
    if (verification.attempts >= 5) {
      await this.authRepository.deleteOtp(normalizedEmail);
      throw new BadRequestError("Terlalu banyak percobaan yang salah. Kode OTP telah dibatalkan. Silakan minta kode baru.");
    }

    // Check OTP match
    if (verification.otp !== cleanOtp) {
      await this.authRepository.incrementOtpAttempts(verification.id);
      const remainingAttempts = 5 - (verification.attempts + 1);
      if (remainingAttempts > 0) {
        throw new BadRequestError(`Kode OTP tidak sesuai. Sisa percobaan: ${remainingAttempts} kali.`);
      } else {
        await this.authRepository.deleteOtp(normalizedEmail);
        throw new BadRequestError("Kode OTP salah dan telah dibatalkan karena melebihi batas percobaan. Silakan minta kode baru.");
      }
    }

    // Mark email verified & activate user
    const verifiedUser = await this.authRepository.markEmailVerified(user.id);
    await this.authRepository.deleteOtp(normalizedEmail);

    // Generate JWT access token
    const accessToken = JwtService.sign({
      sub: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      companyId: verifiedUser.companyId,
      partnerId: verifiedUser.partnerId,
    });

    this.logger.info(`User email verified successfully: ${verifiedUser.id} (${verifiedUser.email})`);

    const { password: _, ...safeUser } = verifiedUser;
    return {
      user: safeUser,
      accessToken,
    };
  }

  async resendOtp(dto: ResendOtpDTO): Promise<{ message: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    this.logger.info(`Resending OTP for: ${normalizedEmail}`);

    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundError("Akun dengan email ini tidak ditemukan");
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestError("Email ini sudah diverifikasi sebelumnya. Silakan langsung masuk.");
    }

    // Generate fresh OTP
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    await this.authRepository.createOrUpdateOtp(normalizedEmail, otp, expiresAt);

    // Send email
    await emailService.sendOtpEmail({
      to: normalizedEmail,
      otp,
      recipientName: user.name,
    });

    this.logger.info(`New OTP sent to: ${normalizedEmail}`);

    return {
      message: "Kode OTP baru telah berhasil dikirim ke email Anda.",
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponseData> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    this.logger.info(`Attempting login for: ${normalizedEmail}`);

    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError("Email atau kata sandi tidak valid");
    }

    const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Email atau kata sandi tidak valid");
    }

    // Check if email has been verified
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedError("EMAIL_NOT_VERIFIED: Akun Anda belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email Anda.");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}. Please contact administrator.`);
    }

    const accessToken = JwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      partnerId: user.partnerId,
    });

    this.logger.info(`User logged in successfully: ${user.id} (${user.email})`);

    const { password: _, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
    };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<SafeUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    this.logger.info(`Updating profile for user: ${userId}`);

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.position !== undefined) updateData.position = dto.position ? dto.position.trim() : null;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl ? dto.avatarUrl.trim() : null;

    const updated = await this.authRepository.updateUser(userId, updateData);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<{ message: string }> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    const isMatch = await PasswordUtil.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Kata sandi saat ini tidak sesuai");
    }

    const isSameAsOld = await PasswordUtil.compare(dto.newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestError("Kata sandi baru tidak boleh sama dengan kata sandi saat ini");
    }

    const hashedPassword = await PasswordUtil.hash(dto.newPassword);
    await this.authRepository.updateUser(userId, { password: hashedPassword });

    this.logger.info(`Password successfully updated for user: ${userId}`);
    return { message: "Kata sandi berhasil diperbarui" };
  }
}
