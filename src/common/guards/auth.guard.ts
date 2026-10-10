import { UserRole } from "@/db/schema/users";
import { UnauthorizedError, ForBiddenError } from "../errors/app-error";
import { JwtService } from "../jwt/jwt.service";
import { JwtUserPayload } from "../jwt/jwt.interface";

export class AuthGuard {
  /**
   * Authenticates the incoming request by verifying Bearer JWT token.
   * Throws UnauthorizedError if token is missing, invalid, or expired.
   */
  static authenticate(request: Request): JwtUserPayload {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Malformed authorization token. Expected 'Bearer <token>'");
    }

    return JwtService.verify(token);
  }

  /**
   * Authorizes that the authenticated user possesses one of the allowed roles (RBAC).
   * Accepts either a Request object (which will be authenticated first) or a JwtUserPayload.
   * Throws UnauthorizedError if not authenticated, or ForBiddenError if role is insufficient.
   */
  static authorize(input: Request | JwtUserPayload, allowedRoles: UserRole[]): JwtUserPayload {
    const user = input instanceof Request ? this.authenticate(input) : input;

    if (!allowedRoles.includes(user.role)) {
      throw new ForBiddenError(
        `Access denied. Role '${user.role}' is not authorized to access this resource`
      );
    }

    return user;
  }
}
