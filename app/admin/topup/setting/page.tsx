import TopupSettingContainer from "@/components/admin/topup/setting-container";

export const metadata = {
  title: "ตั้งค่าการเงิน | Hertz Manager Admin",
  description:
    "จัดการและกำหนดช่องทางการรับเงินของระบบ (TrueMoney Wallet และ โอนผ่านธนาคาร)",
};

const AdminTopupSettingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ตั้งค่าการเงิน
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          กำหนดข้อมูลและเปิด/ปิดช่องทางการรับชำระเงินของร้านค้า
        </p>
      </div>

      <TopupSettingContainer />
    </div>
  );
};

export default AdminTopupSettingPage;