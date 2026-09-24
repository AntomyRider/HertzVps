import type { Metadata } from "next";
import { Noto_Sans_Thai, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import TopLoader from "@/components/ui/top-loader";
import ToastContainer from "@/components/ui/toast";
import BackgroundLightning from "@/components/ui/background-lightning";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hertz Manager",
  description: "เปลี่ยนงานที่ต้องทำซ้ำ ให้กลายเป็นระบบอัตโนมัติ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={cn("dark", "h-full", "antialiased", notoSansThai.variable, notoSansThai.className, "font-sans", geist.variable)}
    >
      <body
        className={`${notoSansThai.className} relative min-h-full flex flex-col font-sans`}
      >
        <BackgroundLightning />
        <TopLoader />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
