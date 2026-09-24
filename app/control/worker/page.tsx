import ControlWorkerSection from "@/components/user/control/worker/section";

const ControlWorkerPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการการทำงาน
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ควบคุมการทำงานของบอท ตรวจสอบสถานะเรียลไทม์ และจัดการหมวดหมู่กลุ่มโพสต์ของแต่ละบัญชีในหน้าเดียว
        </p>
      </div>
      <ControlWorkerSection />
    </div>
  );
};

export default ControlWorkerPage;
