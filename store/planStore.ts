import { create } from "zustand";
import axios from "axios";

export interface PlanItem {
  id: string;
  name: string;
  duration: string;
  durationDays: number;
  price: number;
  subtitle: string;
  badge?: string;
  isHighlighted?: boolean;
  features: string[];
  href: string;
}

interface PlanState {
  plans: PlanItem[];
  isLoading: boolean;
  fetchPlanRedirects: () => Promise<void>;
}

const INITIAL_PLANS: PlanItem[] = [
  {
    id: "starter-1d",
    name: "Starter",
    duration: "1 วัน",
    durationDays: 1,
    price: 19,
    subtitle: "เหมาะสำหรับผู้ที่ต้องการเริ่มต้นทดสอบระบบอัตโนมัติ",
    isHighlighted: false,
    features: [
      "ใช้งานระบบอัตโนมัติครบทุกฟังก์ชัน 24 ชั่วโมง",
      "รองรับการจัดการและสลับหลายบัญชีพร้อมกัน",
      "ระบบหน่วงเวลาอัจฉริยะป้องกันบัญชีถูกจำกัด",
      "ดูสถานะการทำงานและผลลัพธ์แบบเรียลไทม์",
    ],
    href: "/shop",
  },
  {
    id: "premium-30d",
    name: "Premium",
    duration: "30 วัน",
    durationDays: 30,
    price: 199,
    subtitle: "คุ้มค่าสูงสุดสำหรับการใช้งานต่อเนื่องตลอดทั้งเดือน",
    badge: "คุ้มค่าที่สุด",
    isHighlighted: true,
    features: [
      "ใช้งานระบบอัตโนมัติเต็มรูปแบบต่อเนื่อง 30 วัน",
      "รองรับการรันคิวงานอัตโนมัติตลอด 24 ชั่วโมง",
      "ระบบวิเคราะห์สถิติและรายงานผลการทำงานเชิงลึก",
      "อัปเดตฟีเจอร์ใหม่และระบบความปลอดภัยอัตโนมัติ",
      "ทีมงานซัพพอร์ตดูแลและให้คำปรึกษาตลอดการใช้งาน",
    ],
    href: "/shop",
  },
  {
    id: "pro-7d",
    name: "Pro",
    duration: "7 วัน",
    durationDays: 7,
    price: 79,
    subtitle: "ยืดหยุ่นสำหรับงานแคมเปญและการทำตลาดรายสัปดาห์",
    isHighlighted: false,
    features: [
      "ใช้งานระบบอัตโนมัติเต็มประสิทธิภาพ 7 วันเต็ม",
      "ตั้งเวลาและจัดลำดับคิวงานล่วงหน้าได้ไม่จำกัด",
      "ระบบสุ่มข้อความและหน่วงเวลาเสมือนผู้ใช้งานจริง",
      "ติดตามสถานะและควบคุมทุกเครื่องจากศูนย์กลาง",
    ],
    href: "/shop",
  },
];

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: INITIAL_PLANS,
  isLoading: false,

  fetchPlanRedirects: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get<{
        categories: { id: string; name: string }[];
      }>("/api/v1/public/categories");
      const categories = response.data.categories || [];

      if (categories.length === 0) {
        set({ isLoading: false });
        return;
      }

      const defaultCategoryHref = `/shop/${categories[0].id}`;

      const updatedPlans = get().plans.map((plan) => {
        const matchedCategory = categories.find((cat) => {
          const lowerName = cat.name.toLowerCase();
          return (
            lowerName.includes(plan.name.toLowerCase()) ||
            lowerName.includes(String(plan.durationDays)) ||
            lowerName.includes("hertz")
          );
        });

        return {
          ...plan,
          href: matchedCategory
            ? `/shop/${matchedCategory.id}`
            : defaultCategoryHref,
        };
      });

      set({ plans: updatedPlans, isLoading: false });
    } catch (error) {
      console.error("fetchPlanRedirects error:", error);
      set({ isLoading: false });
    }
  },
}));
