import StatsAdmin from "@/components/admin/overview/stats";
import SalesChartAdmin from "@/components/admin/overview/chart";
import DonutAdmin from "@/components/admin/overview/donut";
import RecentOrdersAdmin from "@/components/admin/overview/recent-orders";
import RecentTopupAdmin from "@/components/admin/overview/recent-topup";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">ภาพรวมระบบ</h1>
        <p className="mt-1 text-sm text-neutral-400">
          สรุปข้อมูลสถิติ ยอดขาย และกิจกรรมสำคัญในระบบ
        </p>
      </div>

      <StatsAdmin />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8"><SalesChartAdmin /></div>
        <div className="lg:col-span-4"><DonutAdmin /></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrdersAdmin />
        <RecentTopupAdmin />
      </div>
    </div>
  );
};

export default AdminDashboardPage;