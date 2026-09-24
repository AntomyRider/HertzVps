"use client";

import { NetworkInterface } from "@/store/serverStore";
import { formatBytes } from "./utils";
import { Network, ArrowDownLeft, ArrowUpRight, Wifi } from "lucide-react";

interface NetworkCardProps {
  interfaces: NetworkInterface[];
}

export default function NetworkCard({ interfaces }: NetworkCardProps) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <Network size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">เครือข่ายและการรับส่งข้อมูล (Network I/O)</h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              พบ {interfaces.length} อินเทอร์เฟซที่พร้อมใช้งาน
            </p>
          </div>
        </div>
      </div>

      {/* Network Interface List */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {interfaces.length === 0 ? (
          <div className="col-span-full rounded-sm border border-neutral-800/60 bg-neutral-900/30 p-4 text-center text-xs text-neutral-500">
            ไม่พบอินเทอร์เฟซเครือข่ายภายนอก
          </div>
        ) : (
          interfaces.map((iface) => (
            <div
              key={iface.name}
              className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Wifi size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-white">{iface.name}</span>
                </div>
                <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400">
                  {iface.ip}
                </span>
              </div>

              {iface.mac && iface.mac !== "00:00:00:00:00:00" && (
                <div className="text-[11px] text-neutral-500">
                  <span>MAC: </span>
                  <span className="text-neutral-400">{iface.mac}</span>
                </div>
              )}

              {/* Traffic stats */}
              {(iface.rxBytes !== undefined || iface.txBytes !== undefined) && (
                <div className="grid grid-cols-2 gap-2 border-t border-neutral-800/60 pt-2">
                  <div className="flex items-center gap-1 text-[11px]">
                    <ArrowDownLeft size={13} className="text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-neutral-500">รับ (Rx)</span>
                      <p className="font-medium text-white">
                        {formatBytes(iface.rxBytes || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <ArrowUpRight size={13} className="text-blue-400" />
                    <div>
                      <span className="text-[10px] text-neutral-500">ส่ง (Tx)</span>
                      <p className="font-medium text-white">
                        {formatBytes(iface.txBytes || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
