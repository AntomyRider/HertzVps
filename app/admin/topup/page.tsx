import AdminPaymentsTable from "@/components/admin/topup/table";

export const metadata = {
  title: "จัดการการเติมเงิน | Hertz Manager Admin",
  description: "จัดการและตรวจสอบรายการเติมเงินของลูกค้าในระบบ",
};

const AdminTopupPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการการเติมเงิน
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ตรวจสอบประวัติและรายการเติมเงินทั้งหมดในระบบ
        </p>
      </div>

      <AdminPaymentsTable />
    </div>
  );
};

export default AdminTopupPage;