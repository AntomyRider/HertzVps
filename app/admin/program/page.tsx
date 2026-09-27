import ProgramDashboard from "@/components/admin/program/dashboard";

export const metadata = {
  title: "ภาพรวมของโปรแกรม - Hertz Manager Admin",
  description: "ตรวจสอบสุขภาพและประสิทธิภาพของโปรแกรม Hertz Manager ทั้งระบบ",
};

const ProgramOverviewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ภาพรวมของโปรแกรม
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ตรวจสอบสุขภาพ สถานะออนไลน์ และอัตราความสำเร็จ (Success Rate) ของโปรแกรม Hertz Auto Post ทั้งระบบ
        </p>
      </div>

      <ProgramDashboard />
    </div>
  );
};

export default ProgramOverviewPage;
