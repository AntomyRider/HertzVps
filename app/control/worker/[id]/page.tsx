import ControlAccountGroupsSection from "@/components/user/control/accounts/groups-section";

const ControlWorkerAccountGroupsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการหมวดหมู่กลุ่มโพสต์
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          กำหนดข้อความโพสต์ คอมเมนต์ ความรู้สึก และลิงก์กลุ่มเป้าหมายของบัญชีนี้
        </p>
      </div>
      <ControlAccountGroupsSection accountId={id} />
    </div>
  );
};

export default ControlWorkerAccountGroupsPage;
