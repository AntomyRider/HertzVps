import TableUser from "@/components/admin/user/table";

const UserAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการผู้ใช้งาน
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ตรวจสอบ แก้ไขบทบาท และจัดการยอดเงินของผู้ใช้งานในระบบ
        </p>
      </div>

      <TableUser />
    </div>
  );
};

export default UserAdminPage;