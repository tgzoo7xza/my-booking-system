"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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
    <main className="min-h-screen bg-white">
      {/* --- Navbar เพิ่มส่วนนี้ครับ --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-black text-blue-600">BARBER</Link>
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link href="/login" className="text-slate-600 font-semibold hover:text-blue-600">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition-all">
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-600 text-sm hidden md:block">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="text-red-500 font-semibold hover:text-red-700"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center px-4 mt-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-lg uppercase">Barber Shop</h1>
          <p className="text-xl md:text-2xl mb-10 text-slate-200">จองคิวออนไลน์ สะดวก รวดเร็ว ไม่ต้องรอนาน</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/booking" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1"
            >
              จองคิวตอนนี้เลย
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        <div className="p-6">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">ประหยัดเวลา</h3>
          <p className="text-slate-600">ไม่ต้องมานั่งรอที่ร้านให้เสียเวลา เลือกเวลาที่สะดวกได้เอง</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">ใช้งานง่าย</h3>
          <p className="text-slate-600">จองผ่านมือถือได้ทุกที่ ทุกเวลา เพียงไม่กี่คลิก</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">✂️</div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">บริการคุณภาพ</h3>
          <p className="text-slate-600">ช่างมืออาชีพพร้อมให้บริการคุณในเวลาที่คุณต้องการ</p>
        </div>
      </section>
    </main>
  );
}
