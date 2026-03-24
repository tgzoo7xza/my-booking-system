import type { Metadata, Viewport } from "next"; // นำเข้า Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. ตั้งค่าการแสดงผลบนมือถือ (ป้องกันการซูมและตั้งค่าขนาดหน้าจอ)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // ป้องกันหน้าจอกระตุกซูมตอนจิ้ม Input
};

export const metadata: Metadata = {
  title: "Barber Queue - ระบบจองคิวตัดผม",
  description: "จองคิวตัดผมออนไลน์ สะดวก รวดเร็ว ไม่ต้องรอนาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th" // เปลี่ยนเป็นภาษาไทย
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 overflow-x-hidden text-slate-900">
        {/* คลุม children ด้วย main เพื่อให้จัดการพื้นที่บนมือถือได้ดีขึ้น */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
