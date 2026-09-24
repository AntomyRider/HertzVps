import ServerDashboard from "@/components/admin/server/dashboard";

const ServerAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          สถานะของเซิร์ฟเวอร์
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ตรวจสอบทรัพยากร ประสิทธิภาพ และการทำงานของระบบเซิร์ฟเวอร์แบบ Real-time
        </p>
      </div>

      <ServerDashboard />
    </div>
  );
};

export default ServerAdminPage;