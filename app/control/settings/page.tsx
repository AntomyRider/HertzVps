import ControlSettingsSection from "@/components/user/control/settings/section";

const ControlSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ตั้งค่าความเร็วและบอท
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          กำหนดระยะเวลาหน่วงระหว่างขั้นตอน โหมดพิมพ์ข้อความ และตัวเลือกการทำงานขั้นสูง
        </p>
      </div>
      <ControlSettingsSection />
    </div>
  );
};

export default ControlSettingsPage;
