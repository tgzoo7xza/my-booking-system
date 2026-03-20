"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; // เรียกใช้กุญแจที่เราสร้างไว้
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    // แก้จาก email เป็น email.trim() เพื่อตัดช่องว่างหัว-ท้ายออก
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authError) {
      alert("เกิดข้อผิดพลาด: " + authError.message);
      setLoading(false);
      return;
    }

    // 2. ถ้าสมัคร User สำเร็จ ให้เอาข้อมูลชื่อและเบอร์ไปเก็บในตาราง profiles ที่เราสร้างไว้
    if (authData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id, // ใช้ ID เดียวกันกับ Auth User
            full_name: fullName,
            phone: phone,
            role: "customer"
          },
        ]);

      if (profileError) {
        alert("เก็บข้อมูลโปรไฟล์ไม่สำเร็จ: " + profileError.message);
      } else {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยัน (ถ้ามี)");
        router.push("/login"); // สมัครเสร็จแล้วส่งไปหน้า Login
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-8">สร้างบัญชีใหม่</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text" placeholder="ชื่อ-นามสกุล" required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text" placeholder="เบอร์โทรศัพท์" required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="email" placeholder="อีเมล" required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="รหัสผ่าน (6 ตัวขึ้นไป)" required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
          >
            {loading ? "กำลังบันทึก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-blue-600 font-bold underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </main>
  );
}