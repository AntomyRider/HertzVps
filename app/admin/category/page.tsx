import CategoryTable from "@/components/admin/category/table";

const CategoryAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการหมวดหมู่
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          สร้าง แก้ไข และจัดการหมวดหมู่ทั้งหมดในระบบ
        </p>
      </div>

      <CategoryTable />
    </div>
  );
};

export default CategoryAdminPage;
