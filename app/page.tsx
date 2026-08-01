"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  ShieldCheck, 
  Scissors, 
  ChevronRight, 
  Sparkles,
  Home,
  ListOrdered,
  PlusCircle
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const ADMIN_EMAIL = "fortune02548@gmail.com";

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="page-container">
      {/* Top Navbar */}
      <header className="navbar-header">
        <div className="navbar-container">
            <span className="brand-logo">BARBER.APP</span>
         

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg" />
            ) : !user ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="btn-primary">
                  สมัครสมาชิก
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user.email === ADMIN_EMAIL && (
                  <Link href="/admin" className="badge-admin">
                    <ShieldCheck className="w-4 h-4" /> แผงควบคุม
                  </Link>
                )}
                
                <div className="user-badge">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">{user.email}</span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {user ? (
          /* CASE 1: LOGGED IN USER */
          <div className="space-y-6">
            <div className="hero-card">
              <div className="relative z-10 max-w-xl">
                <div className="badge-pill-blue">
                  <Sparkles className="w-3.5 h-3.5" /> ยินดีต้อนรับกลับมา
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                  พร้อมสำหรับการตัดผมทรงใหม่หรือยัง?
                </h1>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  เลือกจองเวลาล่วงหน้า เลือกช่างที่คุณชอบ และเข้ารับบริการได้ทันทีโดยไม่ต้องรอนาน
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Link href="/booking" className="btn-primary-lg">
                    <PlusCircle className="w-4 h-4" /> จองคิวตัดผมทันที
                  </Link>
                  <Link href="/my-bookings" className="btn-secondary-glass">
                    <ListOrdered className="w-4 h-4" /> คิวของฉัน
                  </Link>
                </div>
              </div>

              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="feature-card">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">จองสะดวกรวดเร็ว</div>
                  <div className="text-sm font-bold text-slate-800">เลือกวัน & เวลาได้เอง</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">ประหยัดเวลา</div>
                  <div className="text-sm font-bold text-slate-800">ไม่ต้องนั่งรอคิวหน้าร้าน</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">ช่างระดับมืออาชีพ</div>
                  <div className="text-sm font-bold text-slate-800">บริการสไตล์พรีเมียม</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 2: GUEST USER */
          <div className="py-12 md:py-20 text-center space-y-8">
            <div className="badge-pill-light">
              ระบบจองคิวตัดผมชายออนไลน์
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              ประณีต มีสไตล์ <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ไม่ต้องเสียเวลานั่งรอ
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
              ยกระดับประสบการณ์การตัดผม จองคิวล่วงหน้าผ่าน Web App ได้ในไม่กี่ขั้นตอน
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Link href="/booking" className="btn-dark-lg group">
                จองคิวเลยตอนนี้
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn-outline-lg">
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* Features Showcase */}
            <div className="grid sm:grid-cols-3 gap-6 pt-16 text-left border-t border-slate-200/80">
              {[
                { title: "1. เลือกบริการ & ช่าง", desc: "เลือกทรงผมหรือบริการที่ต้องการ พร้อมเลือกช่างประจำตัวคุณ" },
                { title: "2. ระบุวันและเวลา", desc: "เลือกรอบเวลาที่สะดวก ตรวจสอบคิวว่างได้แบบ Real-time" },
                { title: "3. รับการแจ้งเตือน", desc: "เข้าใช้บริการได้ทันทีเมื่อถึงเวลา สะดวก ไม่ต้องรอนาน" }
              ].map((item, idx) => (
                <div key={idx} className="feature-step-card">
                  <div className="font-extrabold text-blue-600 text-sm mb-2">{item.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <Link href="/" className="nav-item-active">
          <Home className="w-5 h-5" />
          <span>หน้าแรก</span>
        </Link>
        <Link href="/booking" className="nav-item-inactive">
          <PlusCircle className="w-5 h-5" />
          <span>จองคิว</span>
        </Link>
        <Link href="/my-bookings" className="nav-item-inactive">
          <ListOrdered className="w-5 h-5" />
          <span>คิวของฉัน</span>
        </Link>
      </div>
    </div>
  );
}