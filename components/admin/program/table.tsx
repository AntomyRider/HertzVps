"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Copy, Check, Tag, Users } from "lucide-react";
import { useAutoPageSize } from "@/lib/useAutoPageSize";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import FadeIn from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import {
  useProgramOverviewStore,
  type KeyProgramHealth,
} from "@/store/programOverviewStore";

const DEFAULT_ITEMS_PER_PAGE = 10;

function isEffectiveOnline(item: KeyProgramHealth, now: number): boolean {
  if (!item.isOnline) return false;
  if (item.lastHeartbeatAt > 0 && now - item.lastHeartbeatAt > 20000) {
    return false;
  }
  return true;
}

function formatDuration(
  isOnline: boolean,
  onlineSince: number | null,
  offlineSince: number | null,
  lastHeartbeatAt: number,
  lastSeenAt: number,
  now: number
): string {
  if (isOnline) {
    const start = onlineSince || lastHeartbeatAt || now;
    const diffSec = Math.max(0, Math.floor((now - start) / 1000));
    if (diffSec < 60) return `${diffSec} วินาที`;
    const diffMin = Math.floor(diffSec / 60);
    const remainSec = diffSec % 60;
    if (diffMin < 60) {
      return remainSec > 0
        ? `${diffMin} นาที ${remainSec} วิ`
        : `${diffMin} นาที`;
    }
    const diffHours = Math.floor(diffMin / 60);
    const remainMin = diffMin % 60;
    if (diffHours < 24) {
      return remainMin > 0
        ? `${diffHours} ชม. ${remainMin} นาที ${remainSec} วิ`
        : `${diffHours} ชม. ${remainSec} วิ`;
    }
    const diffDays = Math.floor(diffHours / 24);
    const remainHours = diffHours % 24;
    return remainHours > 0
      ? `${diffDays} วัน ${remainHours} ชม. ${remainMin} นาที`
      : `${diffDays} วัน ${remainMin} นาที`;
  } else {
    const time = offlineSince || lastSeenAt || lastHeartbeatAt;
    if (!time) return "ไม่เคยเชื่อมต่อ";
    const diffSec = Math.max(0, Math.floor((now - time) / 1000));
    if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`;
    const diffMin = Math.floor(diffSec / 60);
    const remainSec = diffSec % 60;
    if (diffMin < 60) {
      return remainSec > 0
        ? `${diffMin} นาที ${remainSec} วิที่แล้ว`
        : `${diffMin} นาทีที่แล้ว`;
    }
    const diffHours = Math.floor(diffMin / 60);
    const remainMin = diffMin % 60;
    if (diffHours < 24) {
      return remainMin > 0
        ? `${diffHours} ชม. ${remainMin} นาทีที่แล้ว`
        : `${diffHours} ชม.ที่แล้ว`;
    }
    const diffDays = Math.floor(diffHours / 24);
    const remainHours = diffHours % 24;
    return remainHours > 0
      ? `${diffDays} วัน ${remainHours} ชม.ที่แล้ว`
      : `${diffDays} วันที่แล้ว`;
  }
}

export default function ProgramKeyTable() {
  const { keys, search, statusFilter } = useProgramOverviewStore();

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [now, setNow] = useState<number>(() => Date.now());
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useAutoPageSize(tableWrapperRef, {
    defaultSize: DEFAULT_ITEMS_PER_PAGE,
    fallbackRowHeight: 53,
  });

  // Real-time ticking interval (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Filter keys by search and status
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // 1. Search filter
      const q = search.trim().toLowerCase();
      if (q) {
        const matchCode = k.code.toLowerCase().includes(q);
        const matchHwid = k.hwid ? k.hwid.toLowerCase().includes(q) : false;
        if (!matchCode && !matchHwid) return false;
      }

      // 2. Status filter (คำนวณสดแบบ Real-time)
      const isOnline = isEffectiveOnline(k, now);
      if (statusFilter === "ONLINE") return isOnline;
      if (statusFilter === "OFFLINE") return !isOnline;

      return true;
    });
  }, [keys, search, statusFilter, now]);

  // Pagination slice (Dynamic auto-calculated itemsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  // Reset page if out of bounds when itemsPerPage changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedKeys = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredKeys.slice(start, start + itemsPerPage);
  }, [filteredKeys, safePage, itemsPerPage]);

  if (filteredKeys.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-12 text-center">
        <Empty
          title="ไม่พบคีย์โปรแกรมที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนคำค้นหา หรือสลับตัวกรองสถานะออนไลน์/ออฟไลน์"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div ref={tableWrapperRef} className="hidden lg:block">
        <Table
          wrapperClassName="rounded-3xl border border-neutral-800 bg-neutral-950"
          footer={
            <Pagination
              embedded
              currentPage={safePage}
              totalItems={filteredKeys.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          }
        >
          <TableHeader>
            <TableRow className="border-b border-neutral-800 hover:bg-transparent">
              <TableHead className="w-16 text-center text-xs text-neutral-400 whitespace-nowrap">
                #
              </TableHead>
              <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
                สถานะ
              </TableHead>
              <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
                คีย์โปรแกรม
              </TableHead>
              <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
                เวอร์ชั่น
              </TableHead>
              <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
                จำนวนบัญชร
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKeys.map((item, idx) => {
              const globalIdx = (safePage - 1) * itemsPerPage + idx + 1;
              const isCopied = copiedKeyId === item.id;
              const isOnline = isEffectiveOnline(item, now);

              return (
                <TableRow
                  key={item.id}
                  className="border-b border-neutral-800/60 transition hover:bg-neutral-900/40"
                >
                  {/* Index */}
                  <TableCell className="text-center font-mono text-xs text-neutral-500 whitespace-nowrap">
                    {globalIdx}
                  </TableCell>

                  {/* 1. Status (Dot Ping + เวลาต่อท้าย) */}
                  <TableCell className="whitespace-nowrap">
                    {isOnline ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs text-emerald-400">
                          {formatDuration(
                            isOnline,
                            item.onlineSince,
                            item.offlineSince,
                            item.lastHeartbeatAt,
                            item.lastSeenAt,
                            now
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-1">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-600" />
                        </span>
                        <span className="text-xs font-medium text-neutral-400">
                          {formatDuration(
                            isOnline,
                            item.onlineSince,
                            item.offlineSince,
                            item.lastHeartbeatAt,
                            item.lastSeenAt,
                            now
                          )}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* 3. Key Program */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tracking-wider text-white">
                        {item.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.code, item.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
                        title="คัดลอกรหัสคีย์"
                      >
                        {isCopied ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* 4. Version */}
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 font-mono text-xs font-medium text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item.version || "v1.0.0"}</span>
                    </span>
                  </TableCell>

                  {/* 5. Account Count */}
                  <TableCell className="whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/50 px-3 py-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span className="font-bold text-white">
                        {item.accountCount}
                      </span>
                      <span className="text-neutral-500">บัญชี</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-3">
        {paginatedKeys.map((item, idx) => {
          const globalIdx = (safePage - 1) * itemsPerPage + idx + 1;
          const isCopied = copiedKeyId === item.id;
          const isOnline = isEffectiveOnline(item, now);

          return (
            <FadeIn
              key={item.id}
              direction="up"
              delay={idx * 30}
              className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3"
            >
              {/* Header: Status (Dot Ping + เวลาต่อท้าย) */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800/60 pb-3">
                {/* Status Dot + Time */}
                {isOnline ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {formatDuration(
                        isOnline,
                        item.onlineSince,
                        item.offlineSince,
                        item.lastHeartbeatAt,
                        item.lastSeenAt,
                        now
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-600" />
                    </span>
                    <span className="text-xs font-medium text-neutral-400">
                      {formatDuration(
                        isOnline,
                        item.onlineSince,
                        item.offlineSince,
                        item.lastHeartbeatAt,
                        item.lastSeenAt,
                        now
                      )}
                    </span>
                  </div>
                )}

                <span className="font-mono text-2xs text-neutral-500">
                  #{globalIdx}
                </span>
              </div>

              {/* Key Code Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-white">
                  {item.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.code, item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
                  title="คัดลอกรหัสคีย์"
                >
                  {isCopied ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              {/* Meta Row: Version + Account Count */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 font-mono text-xs font-medium text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{item.version || "v1.0.0"}</span>
                </span>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/50 px-3 py-1 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="font-bold text-white">
                    {item.accountCount}
                  </span>
                  <span className="text-neutral-500">บัญชี</span>
                </div>
              </div>
            </FadeIn>
          );
        })}

        {/* Mobile Pagination */}
        {filteredKeys.length > itemsPerPage && (
          <div className="pt-2">
            <Pagination
              currentPage={safePage}
              totalItems={filteredKeys.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
