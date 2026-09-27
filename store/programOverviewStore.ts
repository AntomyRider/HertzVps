import { create } from "zustand";
import axios from "axios";
import type { ControllerStats, ControllerLogItem } from "@/store/controllerStore";

export interface ActionHealthMetric {
  action: "POST" | "COMMENT" | "REACTION";
  label: string;
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

export interface KeyProgramHealth {
  id: string;
  code: string;
  isActive: boolean;
  durationDays: number;
  hwid: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  isOnline: boolean;
  isReconnecting: boolean;
  lastHeartbeatAt: number;
  lastSeenAt: number;
  accountCount: number;
  stats: ControllerStats;
  successRate: number;
  actions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric>;
  weakestAction: ActionHealthMetric | null;
  recentErrors: ControllerLogItem[];
}

export interface FleetChartPoint {
  date: string;
  label: string;
  success: number;
  failed: number;
  pending: number;
  total: number;
}

export interface FleetSummary {
  totalKeys: number;
  onlineCount: number;
  offlineCount: number;
  errorCount: number;
  fleetSuccess: number;
  fleetFailed: number;
  fleetPending: number;
  fleetTotal: number;
  fleetSuccessRate: number;
  weakestAction: ActionHealthMetric | null;
  fleetActions: Record<"POST" | "COMMENT" | "REACTION", ActionHealthMetric>;
}

export interface FleetErrorItem extends ControllerLogItem {
  keyCode: string;
}

export type ProgramStatusFilter = "ALL" | "ONLINE" | "OFFLINE" | "HAS_ERRORS";

interface ProgramOverviewState {
  summary: FleetSummary | null;
  chartDataByRange: Record<"7d" | "30d" | "1y", FleetChartPoint[]>;
  chartTimeRange: "7d" | "30d" | "1y";
  keys: KeyProgramHealth[];
  recentFleetErrors: FleetErrorItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  search: string;
  statusFilter: ProgramStatusFilter;
  autoRefreshInterval: number; // in ms, 0 = off

  // Inspector dialog
  selectedKeyHealth: KeyProgramHealth | null;
  isDetailOpen: boolean;

  // Setters
  setSearch: (search: string) => void;
  setStatusFilter: (filter: ProgramStatusFilter) => void;
  setChartTimeRange: (range: "7d" | "30d" | "1y") => void;
  setAutoRefreshInterval: (interval: number) => void;
  setSelectedKeyHealth: (key: KeyProgramHealth | null) => void;
  setIsDetailOpen: (open: boolean) => void;

  // Actions
  fetchOverview: (silent?: boolean) => Promise<void>;
}

export const useProgramOverviewStore = create<ProgramOverviewState>((set, get) => ({
  summary: null,
  chartDataByRange: {
    "7d": [],
    "30d": [],
    "1y": [],
  },
  chartTimeRange: "7d",
  keys: [],
  recentFleetErrors: [],
  isLoading: true,
  isRefreshing: false,
  error: null,
  search: "",
  statusFilter: "ALL",
  autoRefreshInterval: 10_000,

  selectedKeyHealth: null,
  isDetailOpen: false,

  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setChartTimeRange: (chartTimeRange) => set({ chartTimeRange }),
  setAutoRefreshInterval: (autoRefreshInterval) => set({ autoRefreshInterval }),
  setSelectedKeyHealth: (selectedKeyHealth) => set({ selectedKeyHealth }),
  setIsDetailOpen: (isDetailOpen) => set({ isDetailOpen }),

  fetchOverview: async (silent = false) => {
    try {
      if (!silent) {
        if (!get().summary) {
          set({ isLoading: true, error: null });
        } else {
          set({ isRefreshing: true });
        }
      }

      const res = await axios.get<{
        summary: FleetSummary;
        chartDataByRange: Record<"7d" | "30d" | "1y", FleetChartPoint[]>;
        keys: KeyProgramHealth[];
        recentFleetErrors: FleetErrorItem[];
      }>("/api/v1/private/program/overview");

      const currentSelected = get().selectedKeyHealth;
      let updatedSelected = currentSelected;
      if (currentSelected && res.data.keys) {
        const found = res.data.keys.find((k) => k.id === currentSelected.id);
        if (found) updatedSelected = found;
      }

      set({
        summary: res.data.summary,
        chartDataByRange: res.data.chartDataByRange || {
          "7d": [],
          "30d": [],
          "1y": [],
        },
        keys: res.data.keys,
        recentFleetErrors: res.data.recentFleetErrors,
        selectedKeyHealth: updatedSelected,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (err: any) {
      console.error("fetchOverview error:", err);
      set({
        isLoading: false,
        isRefreshing: false,
        error: err.response?.data?.error || "ไม่สามารถโหลดข้อมูลภาพรวมของโปรแกรมได้",
      });
    }
  },
}));
