"use client";

import {
  BarChart3,
  Workflow,
  ShieldCheck,
  Bot,
  Settings2,
  Headset,
  Check,
  Terminal,
  Activity,
  Lock,
} from "lucide-react";

interface PreviewProps {
  isActive: boolean;
}

// 01: Analytics - Live Activity Graph & Real-time Stats
export const AnalyticsPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Top Header Stats */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Live Traffic</span>
        </div>
        <span className="rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">
          +98.4%
        </span>
      </div>

      {/* Animated Soundwave/Activity Bars */}
      <div className="flex h-12 items-end justify-between gap-1.5 px-1 py-1">
        {[40, 75, 55, 90, 65, 85, 45, 100, 70, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-neutral-800 transition-all duration-700 ease-in-out"
            style={{
              height: isActive ? `${h}%` : `${Math.max(25, h * 0.45)}%`,
              backgroundColor: isActive && (i === 3 || i === 7) ? "rgba(59, 130, 246, 0.85)" : undefined,
            }}
          />
        ))}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Queue: 1,420 msgs</span>
        <span className="flex items-center gap-1 font-mono text-blue-400">
          <span className="h-1 w-1 rounded-sm bg-blue-400 animate-ping" />
          Active
        </span>
      </div>
    </div>
  );
};

// 02: Workflow - Multi-step Automation Nodes Pipeline
export const WorkflowPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Top Label */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Workflow size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Auto Pipeline</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">3 Steps</span>
      </div>

      {/* Nodes Connection Flow */}
      <div className="relative flex items-center justify-between px-1 my-auto">
        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 h-[1px] -translate-y-1/2 bg-neutral-800">
          {isActive && (
            <div className="h-full w-1/3 animate-[laser-run_2.4s_linear_infinite] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          )}
        </div>

        {/* Node 1: Trigger */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 text-neutral-300 shadow-sm">
            <span className="text-[10px] font-bold">TRG</span>
          </div>
          <span className="text-[9px] text-neutral-500">Start</span>
        </div>

        {/* Node 2: Delay */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-blue-500/40 bg-neutral-950 text-blue-400 shadow-sm">
            <span className="text-[10px] font-bold">DLY</span>
          </div>
          <span className="text-[9px] text-blue-400">Random</span>
        </div>

        {/* Node 3: Post */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 text-neutral-300 shadow-sm">
            <Check size={11} strokeWidth={2.5} className="text-emerald-400" />
          </div>
          <span className="text-[9px] text-neutral-500">Success</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Interval: 12-25s</span>
        <span className="text-neutral-400">Sync: 100%</span>
      </div>
    </div>
  );
};

// 03: Security - Radar Scanning & HWID Lock
export const SecurityPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Device Protection</span>
        </div>
        <span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
          Secured
        </span>
      </div>

      {/* Center Radar Scanner Frame */}
      <div className="relative flex items-center justify-center py-1">
        <div className="relative flex h-14 w-28 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950/80 px-2">
          {/* Subtle radar line */}
          {isActive && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[laser-run_2s_linear_infinite]" />
          )}
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-semibold text-neutral-200">
                HWID: VERIFIED
              </span>
              <span className="text-[9px] text-neutral-500">AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Single Device Lock</span>
        <span className="text-emerald-400 font-mono">Protected</span>
      </div>
    </div>
  );
};

// 04: Automation - 24/7 Terminal Log Console
export const AutomationPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Terminal size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Worker Console</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-sm bg-neutral-700" />
          <span className="h-1.5 w-1.5 rounded-sm bg-neutral-700" />
          <span className="h-1.5 w-1.5 rounded-sm bg-neutral-700" />
        </div>
      </div>

      {/* Console Output Log Lines */}
      <div className="my-auto space-y-1 font-mono text-[9px] text-neutral-400">
        <div className="flex items-center gap-1 text-emerald-400">
          <span>●</span>
          <span>RUNNER_01: RUNNING (24/7)</span>
        </div>
        <div className="truncate text-neutral-300">
          &gt; Task: queue_worker_batch [OK]
        </div>
        <div className="truncate text-neutral-500">
          &gt; Loop: active • delay 15s
        </div>
      </div>

      {/* Bottom Uptime */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Uptime: 99.98%</span>
        <span className="font-mono text-blue-400">Continuous</span>
      </div>
    </div>
  );
};

// 05: Management - Interactive Switch & Settings Controls
export const ManagementPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Settings2 size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Quick Config</span>
        </div>
        <span className="rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
          Easy Mode
        </span>
      </div>

      {/* Simulated Setting Switches */}
      <div className="my-auto space-y-2">
        {/* Row 1: Auto Schedule */}
        <div className="flex items-center justify-between rounded-sm border border-neutral-850 bg-neutral-950/60 px-2 py-1">
          <span className="text-[10px] text-neutral-300">Auto Scheduling</span>
          {/* Toggle Switch */}
          <div
            className={`h-4 w-7 rounded-sm p-0.5 transition-colors duration-300 ${
              isActive ? "bg-blue-600" : "bg-neutral-800"
            }`}
          >
            <div
              className={`h-3 w-3 rounded-sm bg-white transition-transform duration-300 ${
                isActive ? "translate-x-3" : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {/* Row 2: Random Delay */}
        <div className="flex items-center justify-between rounded-sm border border-neutral-850 bg-neutral-950/60 px-2 py-1">
          <span className="text-[10px] text-neutral-300">Smart Anti-Ban</span>
          <div className="h-4 w-7 rounded-sm bg-blue-600 p-0.5">
            <div className="h-3 w-3 translate-x-3 rounded-sm bg-white" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Profiles: 5 Loaded</span>
        <span className="text-neutral-400">1-Click Apply</span>
      </div>
    </div>
  );
};

// 06: Support - Live Chat Simulation
export const SupportPreview = ({ isActive }: PreviewProps) => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Headset size={13} className="text-blue-400" />
          <span className="text-[11px] font-medium text-neutral-300">Hertz Support</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" />
          <span>Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="my-auto space-y-1.5 text-[9px]">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="rounded-sm bg-blue-600/30 border border-blue-500/30 px-2 py-1 text-neutral-200">
            ขอคำแนะนำการตั้งค่าครับ
          </div>
        </div>

        {/* Admin Response with Typing Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-blue-500/10 text-[9px] font-bold text-blue-400">
            H
          </div>
          <div className="flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300">
            <span>ยินดีช่วยเหลือตลอด 24 ชม.</span>
            {isActive && (
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 rounded-sm bg-blue-400 animate-pulse" />
                <span className="h-1 w-1 rounded-sm bg-blue-400 animate-pulse delay-100" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
        <span>Response: &lt; 5 mins</span>
        <span className="text-blue-400">Direct Chat</span>
      </div>
    </div>
  );
};

// Main Dispatcher Component
export const FeaturePreview = ({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) => {
  switch (id) {
    case "analytics":
      return <AnalyticsPreview isActive={isActive} />;
    case "workflow":
      return <WorkflowPreview isActive={isActive} />;
    case "security":
      return <SecurityPreview isActive={isActive} />;
    case "automation":
      return <AutomationPreview isActive={isActive} />;
    case "management":
      return <ManagementPreview isActive={isActive} />;
    case "support":
      return <SupportPreview isActive={isActive} />;
    default:
      return null;
  }
};
