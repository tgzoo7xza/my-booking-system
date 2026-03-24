"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id, 
              full_name: fullName,
              phone: phone,
              role: "customer"
            },
          ]);

        if (profileError) throw profileError;

        await Swal.fire({
          title: "ยินดีต้อนรับครับ!",
          text: "สมัครสมาชิกสำเร็จแล้ว เริ่มจองคิวกันได้เลย",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-[2.5rem] border-none shadow-2xl",
            title: "font-black text-slate-950",
            htmlContainer: "font-medium text-slate-500"
          }
        });

        router.push("/login"); 
      }
    } catch (err: any) {
      Swal.fire({
        title: "สมัครไม่สำเร็จ",
        text: err.message === "User already registered" ? "อีเมลนี้มีในระบบแล้วครับ" : err.message,
        icon: "error",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-[2.5rem]" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-blue-100 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full"></div>
      
      <div className="max-w-[480px] w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-10 md:p-14 border border-slate-200/50 animate-fade-in">
          
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
              BARBER<span className="text-blue-600">.</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2">สร้างบัญชีใหม่</h1>
            <p className="text-slate-400 text-sm font-medium">กรอกข้อมูลเพื่อเริ่มต้นการจองคิวที่ง่ายกว่า</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Group: Name & Phone (Grid on Tablet/PC) */}
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                <input
                  type="text" placeholder="สมชาย ใจดี" required
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                <input
                  type="text" placeholder="08x-xxx-xxxx" required
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">อีเมล</label>
              <input
                type="email" placeholder="name@example.com" required
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสผ่าน</label>
              <input
                type="password" placeholder="••••••••" required
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-[#fcfcfc] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium tracking-widest placeholder:text-slate-200"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-300 transition-all text-sm uppercase tracking-widest overflow-hidden mt-4"
            >
              <span className="relative z-10">
                {loading ? "กำลังบันทึกข้อมูล..." : "สร้างบัญชีสมาชิก"}
              </span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="text-blue-600 font-black hover:text-slate-950 transition-colors ml-1">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          BARBER STUDIO — SINCE 2026
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