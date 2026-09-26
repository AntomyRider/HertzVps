"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Hertz Manager คืออะไร และช่วยอะไรได้บ้าง?",
    answer:
      "Hertz Manager เป็นโปรแกรมจัดการระบบโพสต์อัตโนมัติสำหรับ Facebook ช่วยลดงานที่ต้องทำซ้ำๆ เช่น การโพสต์กลุ่ม ตั้งเวลาโพสต์ และจัดการหลายบัญชีในที่เดียว เพื่อเพิ่มยอดขายและประหยัดเวลาการทำงานของคุณ",
  },
  {
    question: "จำเป็นต้องมีความรู้ด้านคอมพิวเตอร์หรือโค้ดดิ้งไหม?",
    answer:
      "ไม่จำเป็นเลยครับ ระบบออกแบบมาให้ใช้งานง่าย เมนูเป็นมิตร มีคู่มือสอนการตั้งค่าอย่างละเอียด และมีทีมงานคอยช่วยเหลือตั้งแต่เริ่มต้นจนใช้งานได้คล่อง",
  },
  {
    question: "สามารถจัดการพร้อมกันได้กี่บัญชี?",
    answer:
      "รองรับการใช้งานหลายบัญชีพร้อมกัน โดยขึ้นอยู่กับแพ็กเกจที่คุณเลือกใช้งาน ระบบมีระบบแบ่งการทำงานและคิวงานเพื่อความเสถียรและราบรื่น",
  },
  {
    question: "โปรแกรมมีความปลอดภัยต่อบัญชี Facebook แค่ไหน?",
    answer:
      "ระบบของเรามีอัลกอริทึมจำลองพฤติกรรมการใช้งานเหมือนมนุษย์ (Human-like activity) พร้อมระบบ Random หน่วงเวลาในการโพสต์ เพื่อลดความเสี่ยงจากการถูกจำกัดการใช้งานจาก Facebook",
  },
  {
    question: "หากพบปัญหาหรือใช้งานไม่เป็น มีทีมงานช่วยเหลือไหม?",
    answer:
      "เรามีทีมงานซัพพอร์ตคอยให้คำปรึกษา แนะนำการตั้งค่า และแก้ปัญหาการใช้งานตลอดระยะเวลาการเป็นสมาชิก มั่นใจได้ว่าจะไม่ถูกทิ้งแน่นอนครับ",
  },
];

const FAQHome = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <FadeIn direction="up" className="text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            คำถามที่พบบ่อย
          </h2>

          <p className="mt-3 text-base text-neutral-400">
            รวบรวมข้อสงสัยและคำถามที่พบบ่อยเกี่ยวกับโปรแกรม Hertz Manager
          </p>
        </FadeIn>

        {/* FAQ Accordion */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <FadeIn key={faq.question} direction="up" delay={index * 60}>
                <div className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/50 backdrop-blur-xs transition hover:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold text-white transition hover:text-blue-400"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-500" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-neutral-800/60 px-5 pt-3 pb-5 text-sm leading-6 text-neutral-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQHome;
