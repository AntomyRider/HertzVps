import type { Metadata } from "next";
import { Noto_Sans_Thai, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import TopLoader from "@/components/ui/top-loader";
import ToastContainer from "@/components/ui/toast";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hertz",
  description: "เปลี่ยนงานที่ต้องทำซ้ำ ให้กลายเป็นระบบอัตโนมัติ",
  icons: {
    icon: "/hertz_logo.png",
    shortcut: "/hertz_logo.png",
    apple: "/hertz_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={cn("dark", "h-full", "antialiased", notoSansThai.variable, notoSansThai.className, "font-sans", geist.variable)}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Passero+One&display=swap"
        />
      </head>
      <body
        className={`${notoSansThai.className} relative min-h-full flex flex-col font-sans bg-neutral-900`}
      >
        <TopLoader />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
