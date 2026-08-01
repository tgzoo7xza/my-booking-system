"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Scissors, 
  ArrowLeft 
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          text: "เข้าสู่ระบบสำเร็จเรียบร้อยแล้วครับ",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl border border-slate-100 shadow-2xl",
            title: "font-black text-slate-900",
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
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* Top Navbar Header */}
      <header className="max-w-md w-full mx-auto flex justify-between items-center py-2">
          <span className="brand-logo">BARBER.APP</span>

        <Link 
          href="/" 
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/50"
        >
          <ArrowLeft className="w-4 h-4" /> หน้าแรก
        </Link>
      </header>

      {/* Main Login Form Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              เข้าสู่ระบบผู้ใช้งาน
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              เข้าสู่ระบบเพื่อจัดการประวัติและรายการจองคิวของคุณ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> อีเมลผู้ใช้งาน
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> รหัสผ่าน
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:bg-slate-300 transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-slate-500 text-xs font-medium">
              ยังไม่มีบัญชีสมาชิก?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline ml-0.5">
                สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-[11px] font-semibold text-slate-400">
          © BARBER SHOP STUDIO — ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
}