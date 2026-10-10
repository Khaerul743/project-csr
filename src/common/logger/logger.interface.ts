export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMetadata = Record<string, unknown>;

export interface ILogger {
    debug(message: string, meta?: LogMetadata): void;
    info(message: string, meta?: LogMetadata): void;
    warn(message: string, meta?: LogMetadata): void;
    error(message: string, error?: unknown, meta?: LogMetadata): void;
    forContext(context: string): ILogger;
}
