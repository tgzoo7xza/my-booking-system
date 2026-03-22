"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        alert("ยินดีต้อนรับกลับมาครับ!");
        
        // 🚩 จุดแก้ไข: ใส่ Email แอดมินของคุณที่นี่
        const adminEmail = "fortune02548@gmail.com"; 
        
        if (data.session.user.email === adminEmail) {
          // ถ้าเป็นแอดมิน ให้ไปหน้าจัดการคิว
          router.push("/admin");
        } else {
          // ถ้าเป็นลูกค้าทั่วไป ให้ไปหน้าจองคิวหลัก
          router.push("/");
        }
        
        router.refresh();
      }
    } catch (err: any) {
      alert("เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-2">เข้าสู่ระบบ</h1>
        <p className="text-center text-slate-500 mb-8">เข้าใช้งานเพื่อจัดการคิวของคุณ</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">อีเมล</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">รหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-blue-300 mt-2"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600">
          ยังไม่มีบัญชี? <Link href="/register" className="text-blue-600 font-bold hover:underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </main>
  );
}