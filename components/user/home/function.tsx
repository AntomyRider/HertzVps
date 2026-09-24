import {
  BarChart3,
  Workflow,
  ShieldCheck,
  Bot,
  Settings2,
  Headset,
} from "lucide-react";

const FunctionHome = () => {
  const features = [
    {
      icon: BarChart3,
      title: "วิเคราะห์ข้อมูล",
      description: "ติดตามข้อมูลและสถิติการทำงาน เพื่อช่วยให้คุณเห็นภาพรวมได้ชัดเจนยิ่งขึ้น",
    },
    {
      icon: Workflow,
      title: "ทำงานอย่างเป็นระบบ",
      description: "จัดการขั้นตอนการทำงานอย่างเป็นระบบ ลดความซับซ้อนในการใช้งาน",
    },
    {
      icon: ShieldCheck,
      title: "ปลอดภัย",
      description: "ให้ความสำคัญกับความปลอดภัยของข้อมูลและการใช้งานของคุณ",
    },
    {
      icon: Bot,
      title: "ทำงานอัตโนมัติ",
      description: "ลดงานที่ต้องทำซ้ำด้วยระบบอัตโนมัติ ช่วยประหยัดเวลาในการทำงาน",
    },
    {
      icon: Settings2,
      title: "จัดการได้ง่าย",
      description: "ตั้งค่าและควบคุมการทำงานได้ง่าย พร้อมอินเทอร์เฟซที่ใช้งานสะดวก",
    },
    {
      icon: Headset,
      title: "ซัพพอร์ตตลอดการใช้งาน",
      description: "พร้อมให้ความช่วยเหลือและดูแลการใช้งานตลอดระยะเวลาที่คุณใช้งาน",
    },
  ];

  return (
    <section className="w-full px-6 py-24">
        <div className="mb-12">
          <span className="text-sm font-medium text-blue-500">
            ทำไมต้องเรา?
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            ออกแบบมาเพื่อให้การทำงานง่ายขึ้น
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
            เครื่องมือที่ช่วยจัดการงานอัตโนมัติได้อย่างมีประสิทธิภาพ
            พร้อมฟังก์ชันที่ออกแบบมาให้เหมาะกับการใช้งานจริง
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-blue-500/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default FunctionHome;