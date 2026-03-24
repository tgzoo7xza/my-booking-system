"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Swal from "sweetalert2";

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
        .order("booking_date", { ascending: false });

      if (!error) setBookings(data);
    }
    setLoading(false);
  };

  const handleCancel = async (id: string, bookingDate: string, bookingTime: string, hairStyle: string) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "ต้องการยกเลิกคิว?",
      text: "แจ้งเหตุผลสักนิด เพื่อให้ทางร้านปรับปรุงครับ",
      input: "text",
      inputPlaceholder: "ระบุสาเหตุที่นี่...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a", // Slate-950
      cancelButtonColor: "#f1f5f9",
      confirmButtonText: "ยืนยันการยกเลิก",
      cancelButtonText: "ไม่ยกเลิก",
      customClass: {
        popup: "rounded-[2.5rem] border-none",
        input: "rounded-2xl border-slate-100 bg-slate-50 font-medium",
        cancelButton: "text-slate-500 font-bold",
        confirmButton: "font-black"
      },
      inputValidator: (value) => {
        if (!value) return "กรุณาระบุสาเหตุด้วยครับ";
      }
    });

    if (isConfirmed && reason) {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (!error) {
        try {
          await fetch("/api/line", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `🚫 ยกเลิกคิว: ${bookingDate} | ${bookingTime} น.\n💇 ทรง: ${hairStyle}\n👤 ผู้จอง: ${user?.email}\n💬 สาเหตุ: ${reason}\n🕒 เวลาทำรายการ: ${now}`
            }),
          });
        } catch (lineError) {
          console.error(lineError);
        }

        Swal.fire({
          title: "ยกเลิกเรียบร้อย",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-[2.5rem]" }
        });
        fetchBookings();
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-20 text-slate-950 selection:bg-blue-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 animate-fade-in">
          <div>
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Personal Schedule
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
              รายการจองคิว<span className="text-blue-600">.</span>
            </h1>
            <p className="text-slate-500 font-medium">จัดการคิวตัดผมและตรวจสอบสถานะของคุณ</p>
          </div>
          <Link href="/" className="mt-6 md:mt-0 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            ← ย้อนกลับหน้าแรก
          </Link>
        </header>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-200/50 animate-fade-in">
            <div className="text-5xl mb-6">🗓️</div>
            <p className="text-slate-400 text-lg font-bold mb-8 uppercase tracking-widest">ยังไม่มีรายการจองคิวในขณะนี้</p>
            <Link href="/booking" className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95 inline-block text-xs">
              จองคิวครั้งแรกเลย
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 animate-fade-in">
            {bookings.map((item) => (
              <div key={item.id} className="group bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">
                    💈
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                        {item.hair_style}
                      </span>
                    </div>
                    <p className="font-black text-3xl text-slate-950 tracking-tighter">{item.booking_date}</p>
                    <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-1">เวลา {item.booking_time} น.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                  {/* Status Badge */}
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                    item.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-400'
                  }`}>
                    {item.status === 'confirmed' ? '✓ ยืนยันแล้ว' : 
                     item.status === 'rejected' ? '✕ ถูกปฏิเสธ' : '⌛ รอการยืนยัน'}
                  </div>
                  
                  {item.status === 'pending' && (
                    <button 
                      onClick={() => handleCancel(item.id, item.booking_date, item.booking_time, item.hair_style)}
                      className="w-full sm:w-auto text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      ยกเลิกคิว
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-20 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            BARBER SHOP — PERSONAL SCHEDULE
          </p>
        </footer>
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