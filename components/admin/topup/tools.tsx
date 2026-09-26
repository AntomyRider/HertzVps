"use client";

import SearchUI from "@/components/ui/search";
import FadeIn from "@/components/ui/fade-in";
import { usePaymentStore } from "@/store/paymentStore";

const ToolsTopup = () => {
  const { adminSearch, setAdminSearch, fetchAdminPayments } =
    usePaymentStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAdminSearch(val);
    fetchAdminPayments(val);
  };

  return (
    <FadeIn
      direction="up"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <SearchUI
        value={adminSearch}
        onChange={handleSearchChange}
        placeholder="ค้นหาชื่อผู้ใช้, Discord ID, รหัสซอง..."
        className="w-full max-w-sm rounded-sm"
      />
    </FadeIn>
  );
};

export default ToolsTopup;
