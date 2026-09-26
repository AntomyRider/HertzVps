"use client";

import { useUserStore } from "@/store/userStore";
import SearchUI from "@/components/ui/search";
import Dropdown from "@/components/ui/dropdown";
import FadeIn from "@/components/ui/fade-in";
import { Users } from "lucide-react";

const roleOptions = [
  { value: "ALL", label: "ทุกบทบาท" },
  { value: "USER", label: "สมาชิกทั่วไป" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

export const ToolsUser = () => {
  const {
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    fetchUsers,
    users,
  } = useUserStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchUsers(val, selectedRole);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    fetchUsers(search, role);
  };

  return (
    <FadeIn
      direction="up"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Search Input & Role Filter */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <SearchUI
          value={search}
          onChange={handleSearchChange}
          placeholder="ค้นหาชื่อผู้ใช้ หรือ Discord ID..."
          className="w-full sm:max-w-xs rounded-sm"
        />

        <div className="w-full sm:w-52">
          <Dropdown
            options={roleOptions}
            value={selectedRole}
            onChange={handleRoleChange}
            placeholder="กรองตามบทบาท"
          />
        </div>
      </div>

      {/* Summary Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-400">
          <Users size={14} className="text-neutral-500" />
          <span>ผู้ใช้ในระบบ:</span>
          <span className="font-semibold text-white">{users.length} คน</span>
        </div>
      </div>
    </FadeIn>
  );
};

export default ToolsUser;
