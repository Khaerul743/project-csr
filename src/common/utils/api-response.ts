import { NextResponse } from "next/server";

export interface ApiResponsePayload<T = unknown> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T
}

export class ApiResponse {
    static success<T>(data: T, message: string, statusCode: number = 200): NextResponse<ApiResponsePayload<T>> {
        return NextResponse.json(
            {
                success: true,
                statusCode,
                message,
                data
            },
            { status: statusCode }
        )
    }

    static created<T>(
        data: T,
        message: string = "Created is successfully",
    ): NextResponse<ApiResponsePayload<T>> {
        return ApiResponse.success(data, message, 201)
    }

    static noContent(): NextResponse {
        return new NextResponse(null, { status: 204 })
    }
}