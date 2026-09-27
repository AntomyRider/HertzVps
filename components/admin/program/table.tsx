"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Radio,
  Clock,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import {
  useProgramOverviewStore,
  type KeyProgramHealth,
} from "@/store/programOverviewStore";

const ITEMS_PER_PAGE = 10;

function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return "ไม่เคยเชื่อมต่อ";
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "เมื่อสักครู่";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} วันที่แล้ว`;
}

export default function ProgramKeyTable() {
  const {
    keys,
    search,
    statusFilter,
    setSelectedKeyHealth,
    setIsDetailOpen,
  } = useProgramOverviewStore();

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleOpenDetail = (key: KeyProgramHealth) => {
    setSelectedKeyHealth(key);
    setIsDetailOpen(true);
  };

  // Filter keys
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // 1. Search filter
      const q = search.trim().toLowerCase();
      if (q) {
        const matchCode = k.code.toLowerCase().includes(q);
        const matchHwid = k.hwid ? k.hwid.toLowerCase().includes(q) : false;
        if (!matchCode && !matchHwid) return false;
      }

      // 2. Status filter
      if (statusFilter === "ONLINE") return k.isOnline;
      if (statusFilter === "OFFLINE") return !k.isOnline;
      if (statusFilter === "HAS_ERRORS") {
        return (
          k.stats.failed > 0 ||
          (k.stats.total > 0 && k.successRate < 80) ||
          (k.weakestAction && k.weakestAction.failed > 0)
        );
      }

      return true;
    });
  }, [keys, search, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredKeys.length / ITEMS_PER_PAGE);
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedKeys = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredKeys.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredKeys, safePage]);

  return (
    <div className="space-y-4">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="border-b border-neutral-800 hover:bg-transparent">
            <TableHead className="w-12 text-center text-xs text-neutral-400 whitespace-nowrap">
              #
            </TableHead>
            <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
              คีย์โปรแกรม / HWID
            </TableHead>
            <TableHead className="text-xs text-neutral-400 whitespace-nowrap">สถานะ</TableHead>
            <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
              อัตราสำเร็จ (Success Rate)
            </TableHead>
            <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
              จุดอ่อน / ข้อผิดพลาด
            </TableHead>
            <TableHead className="text-xs text-neutral-400 whitespace-nowrap">
              งานสำเร็จ / ล้มเหลว
            </TableHead>
            <TableHead className="w-28 text-right text-xs text-neutral-400 whitespace-nowrap">
              ตรวจสอบ
            </TableHead>
          </TableRow>
        </TableHeader>
            <TableBody>
              {paginatedKeys.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Empty
                      title="ไม่พบคีย์โปรแกรมที่ตรงกับเงื่อนไข"
                      description="ลองเปลี่ยนคำค้นหา หรือสลับตัวกรองสถานะ"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedKeys.map((item, idx) => {
                  const globalIdx = (safePage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const isCopied = copiedKeyId === item.id;
                  const hasErrors =
                    item.stats.failed > 0 || (item.weakestAction && item.weakestAction.failed > 0);

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-neutral-800/60 transition hover:bg-neutral-900/40"
                    >
                      {/* Index */}
                      <TableCell className="text-center text-xs text-neutral-500 font-mono whitespace-nowrap">
                        {globalIdx}
                      </TableCell>

                      {/* Key Code & HWID */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-white">
                              {item.code}
                            </span>
                            <button
                              onClick={() => handleCopy(item.code, item.id)}
                              className="text-neutral-500 transition hover:text-white"
                              title="คัดลอกรหัสคีย์"
                            >
                              {isCopied ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <span className="font-mono text-[11px] text-neutral-500">
                            {item.hwid ? `HWID: ${item.hwid.slice(0, 16)}...` : "ยังไม่ผูกเครื่อง"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Connection Status */}
                      <TableCell className="whitespace-nowrap">
                        {item.isOnline ? (
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-xs font-medium text-emerald-400">
                              ออนไลน์
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
                            <span>ออฟไลน์</span>
                            <span className="text-[11px] text-neutral-600">
                              ({formatTimeAgo(item.lastSeenAt)})
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Success Rate */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-semibold ${
                                item.successRate >= 90
                                  ? "text-emerald-400"
                                  : item.successRate >= 70
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {item.successRate}%
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {item.stats.total} งาน
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-sm bg-neutral-900">
                            <div
                              className={`h-full rounded-sm ${
                                item.successRate >= 90
                                  ? "bg-emerald-500"
                                  : item.successRate >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, item.successRate))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Weakest Action / Issues */}
                      <TableCell className="whitespace-nowrap">
                        {item.weakestAction && item.weakestAction.failed > 0 ? (
                          <div className="inline-flex items-center gap-1.5 rounded-sm border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400">
                            <AlertTriangle size={12} strokeWidth={2} />
                            <span>
                              {item.weakestAction.action} ({item.weakestAction.failed} ครั้ง)
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>ปกติ</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Success vs Failed */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-400 font-medium">
                            +{item.stats.success}
                          </span>
                          <span className="text-neutral-600">/</span>
                          <span
                            className={`font-medium ${
                              item.stats.failed > 0 ? "text-rose-400" : "text-neutral-500"
                            }`}
                          >
                            -{item.stats.failed}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions / Inspect */}
                      <TableCell className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-xs font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                        >
                          <Eye size={12} />
                          <span>ดูสถิติ</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

      {/* Pagination */}
      {filteredKeys.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={safePage}
          totalItems={filteredKeys.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
