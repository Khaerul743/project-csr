import { ConflictError, NotFoundError, UnauthorizedError } from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { PasswordUtil } from "@/common/utils/password";
import { JwtService } from "@/common/jwt/jwt.service";
import { AuthRepository } from "./auth.repository";
import { AuthResponseData, LoginDTO, RegisterDTO, SafeUser } from "./auth.interface";

export class AuthService {
  private readonly logger = new AppLogger("AuthService");

  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterDTO): Promise<AuthResponseData> {
    this.logger.info(`Attempting to register user: ${dto.email}`);

    // Check if email already registered
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    // Hash the password
    const hashedPassword = await PasswordUtil.hash(dto.password);

    // Create user in database
    const createdUser = await this.authRepository.createUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: "STAGING",
      companyId: null,
      partnerId: null,
      status: "ACTIVE",
    });

    // Generate JWT access token
    const accessToken = JwtService.sign({
      sub: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      companyId: createdUser.companyId,
      partnerId: createdUser.partnerId,
    });

    this.logger.info(`User registered successfully: ${createdUser.id} (${createdUser.email})`);

    const { password: _, ...safeUser } = createdUser;
    return {
      user: safeUser,
      accessToken,
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponseData> {
    this.logger.info(`Attempting login for: ${dto.email}`);

    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}. Please contact administrator.`);
    }

    const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
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
}
