import { create } from "zustand";

export interface ReviewItem {
  id: string;
  name: string;
  comment: string;
  rating: number;
  tag: string;
}

interface ReviewState {
  topRowReviews: ReviewItem[];
  bottomRowReviews: ReviewItem[];
}

const INITIAL_TOP_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Kittipong S.",
    comment:
      "ตั้งเวลาโพสต์กลุ่มทิ้งไว้ได้ยาวๆ เลยครับ ประหยัดเวลาไปได้เยอะมาก ไม่ต้องมานั่งโพสต์มือทีละกลุ่มเหมือนเมื่อก่อน",
    rating: 5,
    tag: "Auto Post",
  },
  {
    id: "rev-2",
    name: "Nattapong W.",
    comment:
      "รันหลายบัญชีพร้อมกันได้ลื่นมาก ดูสถานะการทำงานของแต่ละบัญชีได้เลยว่ากำลังรันงานถึงขั้นตอนไหน",
    rating: 5,
    tag: "Multi-Account",
  },
  {
    id: "rev-3",
    name: "Pimchanok T.",
    comment:
      "หน้าตาโปรแกรมเข้าใจง่ายมากค่ะ ตอนแรกกลัวว่าจะตั้งค่ายาก แต่มีคู่มือและแอดมินคอยแนะนำจนรันงานได้สบาย",
    rating: 5,
    tag: "Easy Setup",
  },
  {
    id: "rev-4",
    name: "Thanawat K.",
    comment:
      "ระบบหน่วงเวลาสุ่มดีเลย์ทำงานเนียนมาก ลดปัญหาบัญชีโดนจำกัดไปได้เยอะ รันงานต่อเนื่องได้ทั้งวันไร้กังวล",
    rating: 5,
    tag: "Safe Delay",
  },
  {
    id: "rev-5",
    name: "Supakorn C.",
    comment:
      "ชอบระบบสุ่มข้อความและรูปภาพของแต่ละหมวดหมู่กลุ่ม ทำให้โพสต์ดูเป็นธรรมชาติและจัดการกลุ่มเป้าหมายได้เป็นระเบียบ",
    rating: 5,
    tag: "Smart Group",
  },
];

const INITIAL_BOTTOM_REVIEWS: ReviewItem[] = [
  {
    id: "rev-6",
    name: "Chaiwat R.",
    comment:
      "ตั้งค่าคิวงานครั้งเดียวแล้วปล่อยรันยาวได้เลย สะดวกมากสำหรับคนที่มีกลุ่มเป้าหมายเยอะและต้องการความต่อเนื่อง",
    rating: 5,
    tag: "Auto Queue",
  },
  {
    id: "rev-7",
    name: "Waranya P.",
    comment:
      "ตั้งแต่เปลี่ยนมาใช้ Hertz Manager ยอดการมองเห็นเพิ่มขึ้นชัดเจน เพราะโพสต์สม่ำเสมอตลอด 24 ชั่วโมงโดยไม่ต้องเฝ้าจอ",
    rating: 5,
    tag: "24/7 Automation",
  },
  {
    id: "rev-8",
    name: "Phurit M.",
    comment:
      "มีระบบเก็บสถิติและ Log การทำงานครบถ้วน ทำให้รู้เลยว่าแต่ละวันโพสต์สำเร็จกี่รายการ ช่วยวางแผนงานง่ายขึ้นมาก",
    rating: 5,
    tag: "Live Analytics",
  },
  {
    id: "rev-9",
    name: "Anucha B.",
    comment:
      "ทีมงานซัพพอร์ตดูแลดีมากครับ ตอบไวและช่วยแก้ไขปัญหาให้ทันที โปรแกรมอัปเดตให้ใช้งานได้เสถียรตลอด",
    rating: 5,
    tag: "Dedicated Support",
  },
  {
    id: "rev-10",
    name: "Kanokwan L.",
    comment:
      "คุ้มค่ามากสำหรับคนที่ต้องดูแลหลายเพจหลายกลุ่ม ลดภาระงานซ้ำซากไปได้เกือบทั้งหมด แนะนำเลยค่ะ",
    rating: 5,
    tag: "Structured Workflow",
  },
];

export const useReviewStore = create<ReviewState>(() => ({
  topRowReviews: INITIAL_TOP_REVIEWS,
  bottomRowReviews: INITIAL_BOTTOM_REVIEWS,
}));
