"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // ใส่ Email ของคุณตรงนี้เพื่อเปิดสิทธิ์ปุ่ม Admin ลับ
  const ADMIN_EMAIL = "tgzoo7xza@gmail.com"; 

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-black text-blue-600 tracking-tighter">BARBER</Link>
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link href="/login" className="text-slate-600 font-semibold hover:text-blue-600 transition-colors">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-500 text-sm hidden md:block bg-slate-100 px-3 py-1 rounded-full">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 font-semibold hover:text-red-700 transition-colors"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070')] bg-cover bg-center scale-105"></div>
          <div className="relative z-10 text-center px-4 mt-10">
            <h1 className="text-5xl md:text-8xl font-black mb-6 drop-shadow-2xl uppercase italic tracking-tighter">Barber Shop</h1>
            <p className="text-xl md:text-2xl mb-10 text-slate-200 font-light max-w-2xl mx-auto">สัมผัสประสบการณ์การตัดผมที่เหนือระดับ จองคิวออนไลน์ง่ายๆ ในไม่กี่วินาที</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link
                href="/booking"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 w-full md:w-auto"
              >
                จองคิวตอนนี้เลย
              </Link>

              <Link
                href="/my-bookings"
                className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all transform hover:-translate-y-1 w-full md:w-auto"
              >
                รายการจองของฉัน
              </Link>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-24 px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">⏰</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">ประหยัดเวลา</h3>
            <p className="text-slate-500 leading-relaxed">บอกลาการนั่งรอคิวที่ร้านนานๆ เลือกเวลาที่ใช่สำหรับคุณได้ทันที</p>
          </div>
          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">📱</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">ใช้งานง่าย</h3>
            <p className="text-slate-500 leading-relaxed">รองรับทุกอุปกรณ์ ไม่ว่าจะคอมพิวเตอร์หรือมือถือ ก็จองได้ทุกที่</p>
          </div>
          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">✂️</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">ช่างฝีมือดี</h3>
            <p className="text-slate-500 leading-relaxed">การันตีความพอใจด้วยช่างมืออาชีพที่พร้อมเปลี่ยนลุคให้คุณ</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-slate-100 bg-slate-50/50">
        <p className="text-slate-400 text-sm font-medium">© 2026 Barber Shop Booking System</p>
        
        {/* แสดงปุ่ม Admin เฉพาะเมื่อ User ล็อกอินด้วย Email ที่กำหนดเท่านั้น */}
        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg"
            >
              <span className="text-base">⚙️</span> ส่วนจัดการสำหรับร้าน (Admin)
            </Link>
          </div>
        )}

        {/* ปุ่มลับแบบจางๆ สำหรับทดสอบ (ถ้ายังไม่ได้ Login ก็จะเห็นอันนี้) */}
        {!user && (
          <Link 
            href="/admin" 
            className="text-slate-200 hover:text-slate-400 text-[10px] mt-4 inline-block transition-colors"
          >
            Dev Portal
          </Link>
        )}
      </footer>
    </div>
  );
}