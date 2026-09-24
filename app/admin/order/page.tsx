import TableOrder from "@/components/admin/order/table";

const OrderAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการคำสั่งซื้อ
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ตรวจสอบประวัติการสั่งซื้อ และข้อมูลสินค้าที่ส่งมอบให้ผู้ใช้งาน
        </p>
      </div>

      <TableOrder />
    </div>
  );
};

export default OrderAdminPage;
