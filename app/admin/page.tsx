"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

export default function AdminPage() {
  const router = useRouter();
  const [date, setDate] = useState(() => {
    return new Intl.DateTimeFormat('fr-CA', { 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(new Date());
  });

  const [bookedSlots, setBookedSlots] = useState<{
    time: string, 
    status: string, 
    name: string,
    phone?: string,
    hair_style?: string
  }[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ตรวจสอบสิทธิ์ Admin (ใช้ Email ของคุณ)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = "fortune02548@gmail.com"; 

      if (!session || session.user.email !== adminEmail) {
        Swal.fire({
          title: "ปฏิเสธการเข้าถึง",
          text: "เฉพาะผู้ดูแลร้านเท่านั้นที่สามารถเข้าถึงหน้านี้ได้",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  const fetchSlots = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time, status, customer_name, phone, hair_style")
        .eq("booking_date", date)
        .neq("status", "rejected");
      
      if (error) throw error;
      setBookedSlots(data?.map(d => ({
        time: d.booking_time,
        status: d.status,
        name: d.customer_name,
        phone: d.phone,
        hair_style: d.hair_style
      })) || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [date]);

  useEffect(() => { 
    if (!loading) fetchSlots(); 
  }, [fetchSlots, loading]);

  const toggleSlot = async (time: string, currentBooking?: any) => {
    if (currentBooking && currentBooking.status !== "blocked") {
      const result = await Swal.fire({
        title: "ยืนยันการยกเลิก?",
        text: `คุณต้องการยกเลิกคิวของคุณ ${currentBooking.name} หรือไม่?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "ใช่, ยกเลิกคิวนี้",
        cancelButtonText: "ย้อนกลับ",
        customClass: { popup: "rounded-[2rem]" }
      });
      if (!result.isConfirmed) return;
    }

    try {
      if (currentBooking) {
        const { error } = await supabase
          .from("bookings")
          .delete()
          .match({ booking_date: date, booking_time: time });
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("bookings")
          .insert([{
            user_id: user?.id || null,
            booking_date: date,
            booking_time: time,
            customer_name: "📢 ปิดรับคิว",
            status: "blocked",
            phone: "-",
            hair_style: "🚫 ช่างไม่ว่าง"
          }]);
        if (error) throw error;
      }
      await fetchSlots();
    } catch (err: any) {
      Swal.fire("ผิดพลาด", "ไม่สามารถดำเนินการได้: " + err.message, "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-900 tracking-widest uppercase text-xs">กำลังตรวจสอบสิทธิ์ผู้ดูแล...</p>
    </div>
  );

  const customerCount = bookedSlots.filter(b => b.status !== 'blocked').length;
  const blockedCount = bookedSlots.filter(b => b.status === 'blocked').length;

  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-12 selection:bg-blue-100 relative">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* --- DASHBOARD HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">ระบบจัดการหลังบ้าน</p>
            <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">แดชบอร์ด<span className="text-blue-600">.</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none ring-4 ring-blue-500/5 focus:border-blue-600 font-black transition-all"
            />
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
              className="p-4 bg-slate-950 text-white rounded-2xl font-black hover:bg-blue-600 transition-all text-xs uppercase tracking-widest"
            >
              ออกจากระบบ
            </button>
          </div>
        </header>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl shadow-blue-100 relative overflow-hidden group">
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">คิวจองวันนี้</p>
            <h3 className="text-5xl font-black">{customerCount} <span className="text-xl font-normal">คิว</span></h3>
            <div className="absolute -right-4 -bottom-4 opacity-20 text-7xl group-hover:scale-110 transition-transform">📅</div>
          </div>
          
          <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">ช่วงเวลาที่ปิดรับ</p>
            <h3 className="text-5xl font-black text-slate-950">{blockedCount} <span className="text-xl font-normal">ช่วง</span></h3>
          </div>

          <div className="bg-slate-950 text-white p-8 rounded-[3rem] flex flex-col justify-center relative overflow-hidden">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">สถานะเซิร์ฟเวอร์</p>
             <h3 className="text-lg font-black text-green-400 flex items-center gap-2 uppercase">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                ออนไลน์ปกติ
             </h3>
          </div>
        </div>

        {/* --- TIME SLOT MANAGER --- */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-200/50 p-8 md:p-12">
          <div className="mb-10 flex items-center gap-4">
             <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
             <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest">จัดการตารางเวลา</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TIME_SLOTS.map(slot => {
              const booking = bookedSlots.find(b => b.time === slot);
              const isBlocked = booking?.status === "blocked";
              const isCustomer = booking && !isBlocked;

              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot, booking)}
                  className={`relative p-5 rounded-[2rem] text-center transition-all border-2 flex flex-col items-center justify-center gap-1 active:scale-95 duration-300 ${
                    isCustomer ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-lg shadow-blue-100' :
                    isBlocked ? 'bg-slate-950 border-slate-950 text-white shadow-xl' :
                    'bg-[#fcfcfc] border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-500'
                  }`}
                >
                  <span className="text-lg font-black tracking-tighter">{slot}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {isCustomer ? "จองแล้ว" : isBlocked ? "ปิดรับคิว" : "ว่าง"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- CUSTOMER LIST --- */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-200/50 p-8 md:p-12">
          <div className="mb-10 flex items-center gap-4">
             <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
             <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest">รายชื่อลูกค้าวันนี้</h2>
          </div>

          <div className="grid gap-4">
            {bookedSlots.filter(b => b.status !== 'blocked').length > 0 ? (
              bookedSlots
                .filter(b => b.status !== 'blocked')
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((booking, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#fcfcfc] rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center gap-6">
                      <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <span className="text-xl font-black text-blue-600">{booking.time} น.</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{booking.name}</h3>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="text-blue-600">โทร:</span> {booking.phone}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="text-blue-600">ทรงผม:</span> {booking.hair_style}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleSlot(booking.time, booking)}
                      className="mt-4 md:mt-0 px-8 py-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300"
                    >
                      ยกเลิกคิวนี้
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-center py-20 bg-[#fcfcfc] rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-4xl mb-4">💈</div>
                <p className="text-slate-300 font-black text-xs uppercase tracking-[0.2em]">ยังไม่มีรายการจองในวันที่เลือก</p>
              </div>
            )}
          </div>
        </div>
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