"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await Swal.fire({
        title: "อัปเดตสำเร็จ!",
        text: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้วครับ",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        customClass: { 
          popup: "rounded-[2.5rem] border-none shadow-2xl",
          title: "font-black text-slate-950",
          htmlContainer: "font-medium text-slate-500"
        }
      });
      router.push("/login");
    } catch (err: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้",
        icon: "error",
        confirmButtonColor: "#0f172a", // Slate-950
        customClass: { popup: "rounded-[2.5rem]" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-blue-100">
      {/* Background Decor (เบลอๆ แบบหน้าแรก) */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-100/40 blur-[100px] rounded-full"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 border border-slate-200/50 animate-fade-in">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Security Update
            </div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase mb-2">
              ตั้งรหัสผ่านใหม่<span className="text-blue-600">.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">กรุณาระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                New Password (6+ ตัวอักษร)
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                autoFocus
                className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-lg tracking-widest placeholder:text-slate-200"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 disabled:bg-slate-300 transition-all text-sm uppercase tracking-widest overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
              </span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-colors py-2"
            >
              ← ยกเลิกและกลับไป
            </button>
          </form>
        </div>

        {/* Footer ของหน้า Reset */}
        <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          © 2026 BARBER SHOP STUDIO
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