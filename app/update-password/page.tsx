"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Scissors, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isLengthValid = password.length >= 6;
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLengthValid) {
      Swal.fire({
        title: "รหัสผ่านสั้นเกินไป",
        text: "กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษรขึ้นไป",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
      return;
    }

    if (!isMatch) {
      Swal.fire({
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบการยืนยันรหัสผ่านให้อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await Swal.fire({
        title: "อัปเดตสำเร็จ!",
        text: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาล็อกอินใหม่อีกครั้ง",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { 
          popup: "rounded-3xl border border-slate-100 shadow-2xl",
          title: "font-black text-slate-900",
          htmlContainer: "font-medium text-slate-500"
        }
      });
      
      router.push("/login");
    } catch (err: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้",
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
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/50"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
        </button>
          <span className="brand-logo">BARBER.APP</span>
      </div>

      {/* --- Main Card --- */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          
          {/* Header Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 text-blue-600 rounded-2xl mb-4 border border-blue-100">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
              สร้างรหัสผ่านใหม่ที่ปลอดภัยสำหรับการเข้าใช้งานบัญชีของคุณ
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Field 1: New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="อย่างน้อย 6 ตัวอักษร" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 2: Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="ระบุรหัสผ่านซ้ำอีกครั้ง" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Realtime Validation Indicator */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs font-medium">
              <div className={`flex items-center gap-2 ${isLengthValid ? "text-emerald-600" : "text-slate-400"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ความยาวอย่างน้อย 6 ตัวอักษร</span>
              </div>
              <div className={`flex items-center gap-2 ${isMatch ? "text-emerald-600" : "text-slate-400"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>รหัสผ่านตรงกันทั้งสองช่อง</span>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !isLengthValid || !isMatch}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกรหัสผ่าน...</span>
                </>
              ) : (
                <span>ยืนยันการตั้งรหัสผ่านใหม่</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* --- Minimal Footer --- */}
      <footer className="text-center py-4 text-xs font-medium text-slate-400">
        © 2026 BARBER SHOP STUDIO — Security System
      </footer>
    </main>
  );
}