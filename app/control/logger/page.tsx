import ControlLoggerSection from "@/components/user/control/logger/section";

const ControlLoggerPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          บันทึกการทำงานสด (Logger)
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          ติดตามขั้นตอนการทำงานและเหตุการณ์ของบอททั้งหมดแบบเรียลไทม์
        </p>
      </div>
      <ControlLoggerSection />
    </div>
  );
};

export default ControlLoggerPage;
