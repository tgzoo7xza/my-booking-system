"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (!error) setBookings(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">รายการจองของคุณ</h1>
          <Link href="/" className="text-blue-600 hover:underline">กลับหน้าแรก</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <p className="text-slate-500 mb-4">ยังไม่มีรายการจองในขณะนี้</p>
            <Link href="/booking" className="bg-blue-600 text-white px-6 py-2 rounded-full">จองคิวเลย</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">วันที่จอง</p>
                  <p className="font-bold text-lg">{item.booking_date}</p>
                  <p className="text-blue-600 font-semibold">{item.booking_time} น.</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                    item.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {item.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}