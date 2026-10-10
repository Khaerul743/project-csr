import { connection } from "next/server";
import { AppLogger, ErrorHandler } from "@/common";
import { AuthGuard } from "@/common/guards/auth.guard";

const logger = new AppLogger("TestRoute");

export async function GET(request: Request) {
  await connection();
  try {
    const user = AuthGuard.authenticate(request);
    AuthGuard.authorize(user, ["CSR_ADMIN"]);
    logger.info("Hello World");
    return Response.json({ message: "Hello World" }, { status: 200 });
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}