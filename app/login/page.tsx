"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data.session) {
        await Swal.fire({
          title: "ยินดีต้อนรับกลับมา!",
          text: "เข้าสู่ระบบสำเร็จแล้วครับ",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-[2.5rem] border-none shadow-2xl",
            title: "font-black text-slate-950",
            htmlContainer: "font-medium text-slate-500"
          }
        });

        const adminEmail = "fortune02548@gmail.com"; 

        if (data.session.user.email === adminEmail) {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      Swal.fire({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err.message === "Invalid login credentials" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : err.message,
        icon: "error",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-[2.5rem]" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-blue-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full"></div>
      
      <div className="max-w-[440px] w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-10 md:p-14 border border-slate-200/50 animate-fade-in">
          
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
              BARBER<span className="text-blue-600">.</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2">ยินดีต้อนรับ</h1>
            <p className="text-slate-400 text-sm font-medium">เข้าสู่ระบบเพื่อจัดการคิวตัดผมของคุณ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">อีเมลผู้ใช้งาน</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสผ่าน</label>
                {/* แก้ไขตรงนี้: ลบ size-10 ออกเรียบร้อย */}
                <Link href="/forgot-password" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-950 transition-colors">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium tracking-widest placeholder:text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-300 transition-all text-sm uppercase tracking-widest overflow-hidden mt-4"
            >
              <span className="relative z-10">
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              ยังไม่มีบัญชีสมาชิก?{" "}
              <Link href="/register" className="text-blue-600 font-black hover:text-slate-950 transition-colors ml-1">
                สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          BARBER SHOP STUDIO — PREMIUM SERVICE
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>
    </main>
  );
}