"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ดึง ID ของคนที่ Login อยู่ปัจจุบัน
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนจองคิว");
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .insert([
        { 
          user_id: user.id, 
          booking_date: date, 
          booking_time: time,
          status: "pending"
        },
      ]);

    if (error) {
      alert("จองไม่สำเร็จ: " + error.message);
    } else {
      alert("จองคิวสำเร็จแล้ว! รอร้านยืนยันนะครับ");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">จองคิวตัดผม</h1>
        <form onSubmit={handleBooking} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">เลือกวันที่</label>
            <input 
              type="date" required
              className="w-full p-3 border rounded-xl"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">เลือกเวลา</label>
            <select 
              required className="w-full p-3 border rounded-xl"
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">-- เลือกเวลา --</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
            </select>
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการจอง"}
          </button>
        </form>
      </div>
    </main>
  );
}