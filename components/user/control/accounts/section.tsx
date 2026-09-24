"use client";

import {
  Users,
  Trash2,
  FolderOpen,
  ChevronRight,
  User,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import Empty from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";

export const ControlAccountsSection = () => {
  const {
    accounts,
    accountSearch,
    groupsByAccount,
    setAccountSearch,
    deleteAccount,
  } = useControlStore();

  const filteredAccounts = accounts.filter((acc) => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.id.toLowerCase().includes(q) ||
      acc.fbId.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string, name: string) => {
    deleteAccount(id);
    toast.info("ลบบัญชีเรียบร้อยแล้ว", `นำบัญชี "${name}" ออกจากรายการแล้ว`);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Search Input (No Login Button as requested) */}
      <div className="flex flex-col justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center">
        <SearchUI
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
          placeholder="ค้นหาชื่อบัญชี หรือ Facebook UID..."
          className="h-9 rounded-sm bg-neutral-950"
        />

        <div className="text-xs text-neutral-400">
          บัญชีที่ซิงค์ทั้งหมด:{" "}
          <span className="font-bold text-white">{accounts.length}</span> บัญชี
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <Empty
          icon={Users}
          title="ยังไม่มีบัญชีที่ซิงค์จากโปรแกรม"
          description="เมื่อเข้าสู่ระบบบัญชีในโปรแกรม Hertz Auto Post บนเครื่องคอมพิวเตอร์ รายชื่อบัญชีจะซิงค์มาแสดงที่นี่โดยอัตโนมัติ"
          className="border-solid bg-neutral-950"
        />
      ) : filteredAccounts.length === 0 ? (
        <Empty
          icon={Users}
          title={`ไม่พบบัญชีที่ตรงกับคำค้นหา "${accountSearch}"`}
          description="ลองค้นหาด้วยชื่อบัญชีหรือรหัส Facebook UID อื่น"
          className="border-solid bg-neutral-950"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredAccounts.map((acc) => {
            const groups = groupsByAccount[acc.id] || [];
            return (
              <div
                key={acc.id}
                className="flex items-center justify-between gap-4 rounded-md border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400">
                    {acc.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={20} strokeWidth={1.8} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold tracking-tight text-white">
                        {acc.name}
                      </h3>
                      <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                        {groups.length} หมวดหมู่
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-400">
                      ID: {acc.fbId || acc.id}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <ButtonUI
                    href={`/control/accounts/${acc.id}`}
                    className="gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <FolderOpen size={14} />
                    <span>จัดการกลุ่ม</span>
                    <ChevronRight size={14} />
                  </ButtonUI>

                  <ButtonUI
                    type="button"
                    onClick={() => handleDelete(acc.id, acc.name)}
                    title="ลบบัญชี"
                    className="h-8 w-8 cursor-pointer rounded-sm border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </ButtonUI>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ControlAccountsSection;
