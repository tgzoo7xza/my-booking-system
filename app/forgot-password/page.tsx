"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  Scissors, 
  Send, 
  CheckCircle2 
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setIsSent(true);
      
      Swal.fire({
        title: "ส่งลิงก์สำเร็จ!",
        text: "กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณเพื่อดำเนินการต่อ",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        customClass: { 
          popup: "rounded-3xl border border-slate-100 shadow-2xl",
          title: "font-black text-slate-900",
          htmlContainer: "font-medium text-slate-500"
        }
      });
    } catch (err: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err?.message || "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้ในขณะนี้",
        icon: "error",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-3xl" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* --- App Header Navigation --- */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <Link 
          href="/login"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/50"
        >
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้าล็อกอิน
        </Link>

          <span className="brand-logo">BARBER.APP</span>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          
          {!isSent ? (
            /* STATE 1: FORM INPUT */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 text-blue-600 rounded-2xl mb-4 border border-blue-100">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ลืมรหัสผ่าน?
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                  กรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    อีเมลของคุณ
                  </label>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังส่งลิงก์...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STATE 2: SUCCESS VIEW */
            <div className="text-center py-4 space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">เช็กกล่องข้อความของคุณ</h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง <br />
                  <span className="font-bold text-slate-800">{email}</span> แล้ว
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 font-medium text-left">
                💡 **ไม่พบอีเมล?** กรุณาลองเช็กในโฟลเดอร์ <span className="font-bold">Spam</span> หรือ <span className="font-bold">ขยะ</span> ของคุณ
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                >
                  ลองใช้อีเมลอื่น
                </button>
                <Link
                  href="/login"
                  className="block w-full text-center text-xs font-bold text-blue-600 hover:underline py-2"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Minimal Footer --- */}
      <footer className="text-center py-4 text-xs font-medium text-slate-400">
        © 2026 BARBER SHOP STUDIO — Recovery System
      </footer>
    </main>
  );
}