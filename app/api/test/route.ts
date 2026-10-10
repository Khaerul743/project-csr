import { AppLogger, ErrorHandler } from "@/common";
import { AuthGuard } from "@/common/guards/auth.guard";

const logger = new AppLogger("TestRoute");


export async function GET(request: Request) {
    try {
        const user = AuthGuard.authenticate(request);
        AuthGuard.authorize(request, ["CSR_ADMIN"]);
        logger.info("Hello World");
        return Response.json({ message: "Hello World" }, { status: 200 });
    } catch (error) {
        return ErrorHandler.handle(error);
    }
}