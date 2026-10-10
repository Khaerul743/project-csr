import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { AppLogger } from "../logger/app-logger";

export interface ApiErrorPayload {
    success: false,
    statusCode: number,
    message: string,
    details?: unknown
}

export class ErrorHandler {
    private static readonly logger = new AppLogger("ErrorHandler")
    static handle(error: unknown): NextResponse<ApiErrorPayload> {
        if (error instanceof ZodError) {
            const details = error.issues.map((issue) => ({
                field: issue.path.join(".") || "body",
                message: issue.message,
            }));

            this.logger.warn("Validation error occurred", { validationErrors: details });

            return NextResponse.json(
                {
                    success: false,
                    statusCode: 400,
                    message: "Validation Error",
                    details,
                },
                { status: 400 }
            );
        }
        if (error instanceof AppError) {
            this.logger.warn(`AppError [${error.statusCode}]: ${error.message}`, {
                details: error.details,
            });

            return NextResponse.json(
                {
                    success: false,
                    statusCode: error.statusCode,
                    message: error.message,
                    ...(error.details !== undefined ? { details: error.details } : {}),
                },
                { status: error.statusCode }
            );
        } if (error instanceof SyntaxError) {
            this.logger.warn("Malformed JSON in request payload", { error: error.message });

            return NextResponse.json(
                {
                    success: false,
                    statusCode: 400,
                    message: "Invalid JSON format in request body",
                },
                { status: 400 }
            );
        }
        this.logger.error("Unexpected server exception caught", error);

        const message =
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : error instanceof Error
                    ? error.message
                    : "Internal Server Error";

        return NextResponse.json(
            {
                success: false,
                statusCode: 500,
                message,
            },
            { status: 500 }
        );
    }
}