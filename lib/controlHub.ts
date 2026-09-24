import type {
  ControlStatsData,
  ControlDailyStat,
  ControlAccountItem,
  ControlGroupItem,
  ControlBotConfig,
  ControlLogItem,
} from "@/store/controlStore";
import { DEFAULT_BOT_CONFIG } from "@/store/controlStore";

export interface RemoteCommandItem {
  id: string;
  action:
    | "START_ALL"
    | "STOP_ALL"
    | "START_USER"
    | "STOP_USER"
    | "DELETE_ACCOUNT"
    | "CREATE_GROUP"
    | "UPDATE_GROUP"
    | "DELETE_GROUP"
    | "TOGGLE_GROUP"
    | "UPDATE_CONFIG"
    | "RESET_CONFIG"
    | "RESET_ALL_STATS"
    | "RESET_USER_STATS"
    | "CLEAR_LOGS"
    | "SYNC_IMAGES";
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface RemoteTelemetryState {
  stats: ControlStatsData;
  dailyStats: ControlDailyStat[];
  accounts: ControlAccountItem[];
  groupsByAccount: Record<string, ControlGroupItem[]>;
  config: ControlBotConfig;
  logs: ControlLogItem[];
  isAllRunning: boolean;
}

export type SseSubscriber = (event: string, data: unknown) => void;

export interface KeyControlSession {
  keyCode: string;
  lastSyncAt: number;
  telemetry: RemoteTelemetryState;
  commandQueue: RemoteCommandItem[];
  webSubscribers: Set<SseSubscriber>;
  botSubscribers: Set<SseSubscriber>;
}

const globalForControlHub = globalThis as unknown as {
  controlSessions?: Map<string, KeyControlSession>;
};

const sessions =
  globalForControlHub.controlSessions ?? new Map<string, KeyControlSession>();

if (!globalForControlHub.controlSessions) {
  globalForControlHub.controlSessions = sessions;
}

export const getOrCreateControlSession = (
  keyCode: string
): KeyControlSession => {
  const normalized = keyCode.trim();
  let session = sessions.get(normalized);

  if (!session) {
    session = {
      keyCode: normalized,
      lastSyncAt: 0,
      telemetry: {
        stats: { total: 0, success: 0, failed: 0, pending: 0 },
        dailyStats: [],
        accounts: [],
        groupsByAccount: {},
        config: { ...DEFAULT_BOT_CONFIG },
        logs: [],
        isAllRunning: false,
      },
      commandQueue: [],
      webSubscribers: new Set(),
      botSubscribers: new Set(),
    };
    sessions.set(normalized, session);
  } else {
    if (!session.webSubscribers) session.webSubscribers = new Set();
    if (!session.botSubscribers) session.botSubscribers = new Set();
  }

  return session;
};

export const broadcastToWeb = (keyCode: string) => {
  const session = getOrCreateControlSession(keyCode);
  const isOnline =
    session.lastSyncAt > 0 && Date.now() - session.lastSyncAt < 10000;
  const payload = {
    online: isOnline,
    lastSyncAt: session.lastSyncAt
      ? new Date(session.lastSyncAt).toISOString()
      : null,
    state: session.telemetry,
  };

  for (const sub of session.webSubscribers) {
    try {
      sub("STATE_UPDATED", payload);
    } catch {
      session.webSubscribers.delete(sub);
    }
  }
};

const extractCleanFileName = (rawPath: string) => {
  const parts = String(rawPath || "").split(/[\\/]/);
  return parts[parts.length - 1] || rawPath;
};

export const updateSessionTelemetry = (
  keyCode: string,
  partial: Partial<RemoteTelemetryState>
): KeyControlSession => {
  const session = getOrCreateControlSession(keyCode);
  session.lastSyncAt = Date.now();

  let mergedGroupsByAccount = partial.groupsByAccount;
  if (partial.groupsByAccount) {
    const prevByAccount = session.telemetry.groupsByAccount || {};
    mergedGroupsByAccount = {};

    for (const [accId, incomingGroups] of Object.entries(partial.groupsByAccount)) {
      const prevGroups = prevByAccount[accId] || [];
      mergedGroupsByAccount[accId] = (incomingGroups || []).map((g) => {
        const existingGroup = prevGroups.find(
          (pg) => pg.id === g.id || pg.name === g.name
        );
        const rawImages = Array.isArray(g.images) ? g.images : [];
        const cleanImages = rawImages.map(extractCleanFileName);

        const combinedPreviews: Record<string, string> = {
          ...(existingGroup?.imagePreviews || {}),
          ...(g.imagePreviews || {}),
        };

        return {
          ...g,
          images: cleanImages,
          imagePreviews: combinedPreviews,
        };
      });
    }
  }

  session.telemetry = {
    ...session.telemetry,
    ...partial,
    ...(mergedGroupsByAccount ? { groupsByAccount: mergedGroupsByAccount } : {}),
  };
  broadcastToWeb(keyCode);
  return session;
};

export const mergeGroupImagePreviews = (
  keyCode: string,
  imagePreviewsByGroup: Record<string, Record<string, Record<string, string>>>
): KeyControlSession => {
  const session = getOrCreateControlSession(keyCode);
  const currentByAcc = { ...session.telemetry.groupsByAccount };

  for (const [accId, groupMap] of Object.entries(imagePreviewsByGroup || {})) {
    const groups = currentByAcc[accId];
    if (!Array.isArray(groups)) continue;

    currentByAcc[accId] = groups.map((g) => {
      const incomingForGroup = groupMap[g.name];
      if (!incomingForGroup) return g;

      const nextPreviews: Record<string, string> = {
        ...(g.imagePreviews || {}),
        ...incomingForGroup,
      };
      const existingNames = Array.isArray(g.images)
        ? g.images.map(extractCleanFileName)
        : [];
      const incomingNames = Object.keys(incomingForGroup).map(extractCleanFileName);
      const mergedNames = Array.from(new Set([...existingNames, ...incomingNames]));

      return {
        ...g,
        images: mergedNames,
        imagePreviews: nextPreviews,
      };
    });
  }

  session.telemetry.groupsByAccount = currentByAcc;
  broadcastToWeb(keyCode);
  return session;
};

const applyOptimisticMutationToHub = (
  session: KeyControlSession,
  action: RemoteCommandItem["action"],
  payload?: Record<string, unknown>
) => {
  const t = session.telemetry;
  switch (action) {
    case "DELETE_ACCOUNT": {
      const accountId = String(payload?.accountId || payload?.userId || "");
      if (accountId) {
        t.accounts = t.accounts.filter((a) => a.id !== accountId);
        const nextGroups = { ...t.groupsByAccount };
        delete nextGroups[accountId];
        t.groupsByAccount = nextGroups;
      }
      break;
    }
    case "CREATE_GROUP": {
      const accountId = String(payload?.accountId || payload?.userId || "");
      const group = payload?.group as ControlGroupItem | undefined;
      if (accountId && group) {
        const current = t.groupsByAccount[accountId] || [];
        t.groupsByAccount = {
          ...t.groupsByAccount,
          [accountId]: [group, ...current],
        };
      }
      break;
    }
    case "UPDATE_GROUP": {
      const accountId = String(payload?.accountId || payload?.userId || "");
      const groupId = String(payload?.groupId || "");
      const oldName = String(payload?.oldName || "");
      const dataObj = (payload?.data as Partial<ControlGroupItem> | undefined) || {};
      if (accountId) {
        const current = t.groupsByAccount[accountId] || [];
        t.groupsByAccount = {
          ...t.groupsByAccount,
          [accountId]: current.map((g) =>
            g.id === groupId || (oldName && g.name === oldName)
              ? {
                  ...g,
                  name: String(payload?.name ?? dataObj.name ?? g.name),
                  content: String(payload?.content ?? dataObj.content ?? g.content),
                  comments: String(payload?.comments ?? dataObj.comments ?? g.comments),
                  reaction:
                    (payload?.reaction as ControlGroupItem["reaction"]) ??
                    dataObj.reaction ??
                    g.reaction,
                  links: Array.isArray(payload?.links)
                    ? (payload.links as string[])
                    : Array.isArray(dataObj.links)
                    ? dataObj.links
                    : g.links,
                  images: Array.isArray(dataObj.images)
                    ? dataObj.images
                    : Array.isArray(payload?.existingImages)
                    ? (payload.existingImages as string[])
                    : g.images,
                  imagePreviews: dataObj.imagePreviews ?? g.imagePreviews,
                  randomContent: Boolean(
                    payload?.randomContent ?? dataObj.randomContent ?? g.randomContent
                  ),
                  randomImage: Boolean(
                    payload?.randomImage ?? dataObj.randomImage ?? g.randomImage
                  ),
                  randomReaction: Boolean(
                    payload?.randomReaction ?? dataObj.randomReaction ?? g.randomReaction
                  ),
                }
              : g
          ),
        };
      }
      break;
    }
    case "DELETE_GROUP": {
      const accountId = String(payload?.accountId || payload?.userId || "");
      const groupId = String(payload?.groupId || "");
      const groupName = String(payload?.name || payload?.groupName || "");
      if (accountId) {
        const current = t.groupsByAccount[accountId] || [];
        t.groupsByAccount = {
          ...t.groupsByAccount,
          [accountId]: current.filter(
            (g) => g.id !== groupId && (!groupName || g.name !== groupName)
          ),
        };
      }
      break;
    }
    case "TOGGLE_GROUP": {
      const accountId = String(payload?.accountId || payload?.userId || "");
      const groupId = String(payload?.groupId || "");
      const groupName = String(payload?.name || payload?.groupName || "");
      if (accountId) {
        const current = t.groupsByAccount[accountId] || [];
        t.groupsByAccount = {
          ...t.groupsByAccount,
          [accountId]: current.map((g) =>
            g.id === groupId || (groupName && g.name === groupName)
              ? { ...g, isActive: Boolean(payload?.isActive) }
              : g
          ),
        };
      }
      break;
    }
    case "START_ALL": {
      t.isAllRunning = true;
      t.accounts = t.accounts.map((a) => ({ ...a, isRunning: true }));
      break;
    }
    case "STOP_ALL": {
      t.isAllRunning = false;
      t.accounts = t.accounts.map((a) => ({ ...a, isRunning: false }));
      break;
    }
    case "START_USER": {
      const accountId = String(payload?.accountId || "");
      t.accounts = t.accounts.map((a) =>
        a.id === accountId ? { ...a, isRunning: true } : a
      );
      break;
    }
    case "STOP_USER": {
      const accountId = String(payload?.accountId || "");
      t.accounts = t.accounts.map((a) =>
        a.id === accountId ? { ...a, isRunning: false } : a
      );
      break;
    }
    case "UPDATE_CONFIG":
    case "RESET_CONFIG": {
      if (payload?.config) {
        t.config = payload.config as ControlBotConfig;
      }
      break;
    }
    case "RESET_ALL_STATS": {
      t.stats = { total: 0, success: 0, failed: 0, pending: 0 };
      t.dailyStats = [];
      break;
    }
    default:
      break;
  }
};

export const enqueueRemoteCommand = (
  keyCode: string,
  action: RemoteCommandItem["action"],
  payload?: Record<string, unknown>
): RemoteCommandItem => {
  const session = getOrCreateControlSession(keyCode);
  const cmd: RemoteCommandItem = {
    id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    payload,
    createdAt: new Date().toISOString(),
  };

  // Apply optimistic state immediately on Hub so stale reads never resurrect deleted items
  applyOptimisticMutationToHub(session, action, payload);

  // If a bot SSE stream is connected, push immediately; also keep in queue until acknowledged/polled
  if (session.botSubscribers.size > 0) {
    for (const sub of session.botSubscribers) {
      try {
        sub("COMMAND", cmd);
      } catch {
        session.botSubscribers.delete(sub);
      }
    }
  } else {
    session.commandQueue.push(cmd);
  }

  broadcastToWeb(keyCode);
  return cmd;
};

export const popPendingCommands = (keyCode: string): RemoteCommandItem[] => {
  const session = getOrCreateControlSession(keyCode);
  const pending = [...session.commandQueue];
  session.commandQueue = [];
  return pending;
};
