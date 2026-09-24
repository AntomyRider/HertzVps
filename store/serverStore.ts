import { create } from "zustand";
import axios from "axios";

export interface SystemMetrics {
  osName: string;
  distro: string;
  distroVersion: string;
  codename?: string;
  kernel: string;
  hostname: string;
  platform: string;
  arch: string;
  uptimeSeconds: number;
}

export interface CpuMetrics {
  usagePercent: number;
  cores: number;
  model: string;
  speedMhz: number;
  loadAvg: [number, number, number];
  perCoreUsage: number[];
}

export interface MemoryMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  buffersCacheBytes: number;
  usagePercent: number;
  swap: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
  };
}

export interface DiskMetrics {
  mount: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
  isAvailable: boolean;
}

export interface DatabaseMetrics {
  status: "connected" | "error";
  latencyMs: number;
  version: string;
  engine: string;
}

export interface NodeMetrics {
  version: string;
  uptimeSeconds: number;
  pid: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  rxBytes?: number;
  txBytes?: number;
}

export interface ServerMetrics {
  system: SystemMetrics;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  database: DatabaseMetrics;
  node: NodeMetrics;
  network: {
    interfaces: NetworkInterface[];
  };
  timestamp: string;
}

interface ServerState {
  metrics: ServerMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshInterval: number; // in milliseconds (0 = off, 3000, 5000, 10000)
  lastUpdated: Date | null;

  // Actions
  fetchMetrics: (silent?: boolean) => Promise<void>;
  setRefreshInterval: (interval: number) => void;
  setError: (error: string | null) => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  metrics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  refreshInterval: 5000, // default auto-refresh every 5 seconds
  lastUpdated: null,

  fetchMetrics: async (silent = false) => {
    if (!silent && !get().metrics) {
      set({ isLoading: true, error: null });
    } else {
      set({ isRefreshing: true, error: null });
    }

    try {
      const response = await axios.get<ServerMetrics>("/api/v1/private/server-status");
      set({
        metrics: response.data,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || "ไม่สามารถดึงข้อมูลสถานะเซิร์ฟเวอร์ได้";
      set({
        isLoading: false,
        isRefreshing: false,
        error: msg,
      });
    }
  },

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
