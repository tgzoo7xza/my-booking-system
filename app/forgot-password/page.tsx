"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Swal from "sweetalert2";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      await Swal.fire({
        title: "ส่งลิงก์สำเร็จ!",
        text: "กรุณาเช็คอีเมลของคุณเพื่อตั้งรหัสผ่านใหม่นะครับ",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        customClass: { 
          popup: "rounded-[2.5rem] border-none shadow-2xl",
          title: "font-black text-slate-950",
          htmlContainer: "font-medium text-slate-500"
        }
      });
    } catch (err: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.message,
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
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full"></div>
      
      <div className="max-w-[440px] w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-10 md:p-14 border border-slate-200/50 animate-fade-in text-center">
          
          {/* Header */}
          <div className="mb-10">
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Security Recovery
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2">
              ลืมรหัสผ่าน<span className="text-blue-600">?</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">ระบุอีเมลที่ใช้สมัคร เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ยืนยันอีเมลของคุณ</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                required
                autoFocus
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-300 transition-all text-sm uppercase tracking-widest overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-10">
            <Link 
              href="/login" 
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-colors"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          BARBER SHOP STUDIO — RECOVERY
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