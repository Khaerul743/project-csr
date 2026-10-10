import { ILogger, LogLevel, LogMetadata } from "./logger.interface"

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const ANSI_COLORS = {
    reset: "\x1b[0m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
};

export class AppLogger implements ILogger {
    private readonly context: string;
    private readonly minLevel: LogLevel;

    constructor(context: string = "App", minLevel?: LogLevel) {
        this.context = context;
        const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
        this.minLevel = minLevel ?? (envLevel && LOG_LEVEL_PRIORITY[envLevel] !== undefined ? envLevel : "info");
    }

    forContext(context: string): AppLogger {
        return new AppLogger(context, this.minLevel);
    }

    debug(message: string, meta?: LogMetadata): void {
        this.log("debug", message, undefined, meta);
    }

    info(message: string, meta?: LogMetadata): void {
        this.log("info", message, undefined, meta);
    }

    warn(message: string, meta?: LogMetadata): void {
        this.log("warn", message, undefined, meta);
    }

    error(message: string, error?: unknown, meta?: LogMetadata): void {
        this.log("error", message, error, meta);
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
    }

    private log(
        level: LogLevel,
        message: string,
        error?: unknown,
        meta?: LogMetadata
    ): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const timestamp = new Date().toISOString();

        if (process.env.NODE_ENV === "production") {
            this.writeJson(level, timestamp, message, error, meta);
        } else {
            this.writePretty(level, timestamp, message, error, meta);
        }
    }

    private writeJson(
        level: LogLevel,
        timestamp: string,
        message: string,
        error?: unknown,
        meta?: LogMetadata
    ): void {
        const errorDetails = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error !== undefined
                ? { raw: error }
                : undefined;

        const entry = {
            timestamp,
            level: level.toUpperCase(),
            context: this.context,
            message,
            ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
            ...(errorDetails ? { error: errorDetails } : {}),
        };

        const serialized = JSON.stringify(entry);
        if (level === "error") {
            console.error(serialized);
        } else if (level === "warn") {
            console.warn(serialized);
        } else {
            console.log(serialized);
        }
    }

    private writePretty(
        level: LogLevel,
        timestamp: string,
        message: string,
        error?: unknown,
        meta?: LogMetadata
    ): void {
        const levelColor = this.getLevelColor(level);
        const formattedLevel = `${levelColor}[${level.toUpperCase().padEnd(5)}]${ANSI_COLORS.reset}`;
        const formattedTimestamp = `${ANSI_COLORS.gray}${timestamp}${ANSI_COLORS.reset}`;
        const formattedContext = `${ANSI_COLORS.magenta}[${this.context}]${ANSI_COLORS.reset}`;

        const output = `${formattedTimestamp} ${formattedLevel} ${formattedContext} ${message}`;

        if (level === "error") {
            console.error(output);
            if (error) {
                if (error instanceof Error && error.stack) {
                    console.error(`${ANSI_COLORS.red}${error.stack}${ANSI_COLORS.reset}`);
                } else {
                    console.error(error);
                }
            }
        } else if (level === "warn") {
            console.warn(output);
        } else {
            console.log(output);
        }

        if (meta && Object.keys(meta).length > 0) {
            console.log(`${ANSI_COLORS.gray}Meta:${ANSI_COLORS.reset}`, meta);
        }
    }

    private getLevelColor(level: LogLevel): string {
        switch (level) {
            case "debug":
                return ANSI_COLORS.cyan;
            case "info":
                return ANSI_COLORS.green;
            case "warn":
                return ANSI_COLORS.yellow;
            case "error":
                return ANSI_COLORS.red;
        }
    }
}
