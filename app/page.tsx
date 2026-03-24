"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
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
    <div className="min-h-screen bg-[#fafafa] text-slate-950 selection:bg-blue-100">
      {/* --- Navbar (Glassmorphism) --- */}
      <nav className="fixed top-0 w-full z-[100] bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-6 md:px-12 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
          BARBER<span className="text-blue-600">.</span>
        </Link>
        
        <div className="flex gap-6 items-center">
          {!user ? (
            <>
              <Link href="/login" className="text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-slate-950 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-2xl shadow-slate-900/10">
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-md hidden md:block">
                {user.email}
              </span>
              <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest">
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* --- Hero Section --- */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-slate-200/50 blur-[100px] rounded-full"></div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">บริการตัดผมชายระดับพรีเมียม</span>
            </div>
            
            <h1 className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tighter mb-8 animate-title uppercase">
              ประณีต<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-950 to-slate-500">มีสไตล์</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-12 text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
              ยกระดับความมั่นใจด้วยช่างมืออาชีพ จองง่าย รวดเร็ว พร้อมบริการที่ออกแบบมาเพื่อคุณโดยเฉพาะ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/booking" className="group relative bg-slate-950 text-white px-12 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:pr-16 active:scale-95 w-full sm:w-auto">
                <span className="relative z-10">จองคิวตอนนี้</span>
                <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
              </Link>

              <Link href="/my-bookings" className="bg-white border border-slate-200 text-slate-950 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto shadow-sm">
                รายการของฉัน
              </Link>
            </div>
          </div>
        </section>

        {/* --- Features --- */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-16">
              {[
                { 
                  title: "ประหยัดเวลา", 
                  desc: "เลือกเวลาที่คุณสะดวกที่สุด ไม่ต้องนั่งรอคิวที่ร้านนานๆ", 
                  icon: "01", 
                  image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=600&auto=format&fit=crop" 
                },
                { 
                  title: "จองง่าย", 
                  desc: "ทำรายการเสร็จใน 3 ขั้นตอน รองรับการใช้งานผ่านมือถือ 100%", 
                  icon: "02", 
                  image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" 
                },
                { 
                  title: "ช่างฝีมือดี", 
                  desc: "ดูแลโดยช่างผู้เชี่ยวชาญ การันตีผลงานความเนี้ยบทุกทรง", 
                  icon: "03", 
                  image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop" 
                }
              ].map((f, i) => (
                <div key={i} className="group relative pt-12 border-t border-slate-100 hover:border-blue-600 transition-colors duration-500 flex flex-col items-center text-center">
                  <span className="absolute top-4 left-0 text-[10px] font-black text-blue-600 tracking-widest">{f.icon}</span>
                  <img src={f.image} alt={f.title} className="w-24 h-24 rounded-full object-cover mb-6 shadow-md transition-transform group-hover:scale-110" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="py-20 bg-[#fafafa] border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            © 2026 BARBER SHOP STUDIO — ระบบจองคิวออนไลน์
          </p>
          
          {user?.email === ADMIN_EMAIL && (
            <Link 
              href="/admin" 
              className="group flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-950 hover:text-white transition-all shadow-xl shadow-slate-200/50"
            >
              <span className="group-hover:rotate-180 transition-transform duration-700">⚙️</span> 
              แผงควบคุมแอดมิน
            </Link>
          )}

          {!user && (
            <Link href="/admin" className="text-slate-200 hover:text-blue-200 text-[8px] mt-8 uppercase tracking-[0.5em] transition-colors">
              สำหรับผู้ดูแลระบบ
            </Link>
          )}
        </div>
      </footer>

      {/* Custom Styles for Animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes title-reveal {
          from { opacity: 0; transform: translateY(40px) skewY(2deg); }
          to { opacity: 1; transform: translateY(0) skewY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-title { animation: title-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
}