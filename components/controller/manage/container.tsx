"use client";

import React, { useState, useEffect } from "react";
import { useControllerStore } from "@/store/controllerStore";
import AccountsPanel from "./accounts-panel";
import GroupsPanel from "./groups-panel";

export default function ContainerManageController() {
  const { accounts, initRealtimeIfNeeded } = useControllerStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"accounts" | "groups">("accounts");

  useEffect(() => {
    initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  // เลือกบัญชีแรกอัตโนมัติหากยังไม่ได้เลือก หรือบัญชีที่เลือกถูกลบไป
  useEffect(() => {
    if (accounts.length > 0) {
      if (!selectedAccountId || !accounts.some((a) => a.id === selectedAccountId)) {
        setSelectedAccountId(accounts[0].id);
      }
    } else {
      setSelectedAccountId(null);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount =
    accounts.find((acc) => acc.id === selectedAccountId) || null;

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    setMobileView("groups");
  };

  const handleMobileBack = () => {
    setMobileView("accounts");
  };

  return (
    <div className="grid h-full min-h-[calc(100vh-140px)] w-full grid-cols-1 md:grid-cols-12 gap-6">
      {/* ฝั่งซ้าย: Accounts Panel (ซ่อนบนจอมือถือเมื่อกำลังดูกลุ่ม) */}
      <div
        className={`col-span-1 md:col-span-4 lg:col-span-3 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-neutral-800 pb-4 md:pb-0 md:pr-6 ${
          mobileView === "groups" ? "hidden md:flex" : "flex"
        }`}
      >
        <AccountsPanel
          selectedAccountId={selectedAccountId}
          onSelectAccount={handleSelectAccount}
        />
      </div>

      {/* ฝั่งขวา: Groups Panel (ซ่อนบนจอมือถือเมื่อกำลังดูรายชื่อบัญชี) */}
      <div
        className={`col-span-1 md:col-span-8 lg:col-span-9 flex flex-col min-h-0 ${
          mobileView === "accounts" ? "hidden md:flex" : "flex"
        }`}
      >
        <GroupsPanel
          selectedAccount={selectedAccount}
          onBack={handleMobileBack}
        />
      </div>
    </div>
  );
}
