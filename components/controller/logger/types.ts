export type LogLevel = "info" | "success" | "warn" | "error" | "debug";

export interface LogItem {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  accountName?: string;
  groupName?: string;
  meta?: Record<string, unknown>;
}

export type LogLevelFilter = "all" | LogLevel;
