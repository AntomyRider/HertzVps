import TableKey from "@/components/admin/key/table";

const KeyAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการคีย์โปรแกรม
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          สร้าง จัดการ และตรวจสอบคีย์สำหรับโปรแกรม Hertz Manager
        </p>
      </div>

      <TableKey />
    </div>
  );
};

export default KeyAdminPage;