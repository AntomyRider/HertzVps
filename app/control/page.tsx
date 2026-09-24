import ControlDashboardShell from "@/components/user/control/dashboard-shell";

const ControlOverviewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ภาพรวมและสั่งงานระบบ
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ติดตามสถิติการโพสต์และสั่งเริ่มหรือหยุดการทำงานของบอทจากระยะไกล
        </p>
      </div>
      <ControlDashboardShell />
    </div>
  );
};

export default ControlOverviewPage;
