import TableProduct from "@/components/admin/product/table";

const ProductAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการสินค้า
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          สร้าง แก้ไข และจัดการสินค้าทั้งหมดในระบบ
        </p>
      </div>

      <TableProduct />
    </div>
  );
};

export default ProductAdminPage;