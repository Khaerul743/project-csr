import jwt, { SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "../errors/app-error";
import { JwtUserPayload } from "./jwt.interface";

export class JwtService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return secret;
  }

  static sign(payload: JwtUserPayload, options?: SignOptions): string {
    const secret = this.getSecret();
    const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];
    return jwt.sign(payload, secret, {
      expiresIn,
      ...options,
    });
  }

  static verify(token: string): JwtUserPayload {
    const secret = this.getSecret();
    try {
      return jwt.verify(token, secret) as JwtUserPayload;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Authentication token has expired");
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid authentication token");
      }
      throw new UnauthorizedError("Failed to authenticate token");
    }
  }
}
