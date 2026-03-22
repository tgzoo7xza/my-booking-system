"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // 1. เพิ่ม useRouter

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

export default function AdminPage() {
  const router = useRouter(); // 2. เรียกใช้ router
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
  const [loading, setLoading] = useState(true); // เริ่มต้นเป็น true เพื่อเช็คสิทธิ์ก่อน

  // 3. เพิ่มระบบตรวจสอบสิทธิ์ Admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // *** สำคัญ: เปลี่ยน 'your-email@gmail.com' เป็น Email ที่คุณสมัครไว้ใน Supabase ***
      const adminEmail = "fortune02548@gmail.com"; 

      if (!session || session.user.email !== adminEmail) {
        alert("ขออภัย เฉพาะช่างเท่านั้นที่เข้าหน้านี้ได้");
        router.push("/login");
      } else {
        setLoading(false); // ถ้าเป็น Admin จริงค่อยให้โหลดข้อมูล
      }
    };
    checkAdmin();
  }, [router]);

  const fetchSlots = useCallback(async () => {
    // ไม่ต้อง setLoading(true) ซ้ำ เพราะเราคุมด้วย loading ด้านบนแล้ว
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
            customer_name: "📢 ช่างปิดรับคิว",
            status: "blocked",
            phone: "-",
            hair_style: "🚫 ปิดรับบริการ"
          }]);
        if (error) throw error;
      }
      await fetchSlots();
    } catch (err: any) {
      alert("ไม่สามารถดำเนินการได้: " + err.message);
    }
  };

  // ถ้ากำลังโหลด (หรือกำลังเช็คสิทธิ์) ให้แสดงหน้าว่างๆ หรือ Loading
  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-10">
       {/* UI เหมือนเดิมของคุณเลยครับ */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900">⚙️ จัดการเวลาเข้าใช้บริการ</h1>
              <p className="text-slate-500">เลือกวันที่เพื่อเปิด-ปิดรับจองคิว</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="p-4 bg-slate-100 rounded-2xl border-none outline-none ring-2 ring-blue-500 font-bold"
              />
              {/* ปุ่ม Logout เพิ่มความสะดวก */}
              <button 
                onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
                className="p-4 bg-rose-100 text-rose-600 rounded-2xl font-bold hover:bg-rose-200 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
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
                  className={`relative p-5 rounded-[2rem] text-center transition-all border-2 flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isCustomer ? 'bg-amber-50 border-amber-200 text-amber-600' :
                    isBlocked ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' :
                    'bg-white border-slate-100 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  <span className="text-lg font-black">{slot}</span>
                  <span className="text-[10px] font-bold uppercase">
                    {isCustomer ? "มีคิวลูกค้า" : isBlocked ? "ปิดรับคิว" : "เปิดว่าง"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-900">📋 รายชื่อลูกค้าวันที่ {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          </div>

          <div className="space-y-4">
            {bookedSlots.filter(b => b.status !== 'blocked').length > 0 ? (
              bookedSlots
                .filter(b => b.status !== 'blocked')
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((booking, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
                        <span className="text-xl font-black text-blue-600">{booking.time} น.</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{booking.name}</h3>
                        <div className="text-sm text-slate-500 flex flex-wrap gap-x-4">
                          <span>📱 {booking.phone || "-"}</span>
                          <span>💇‍♂️ {booking.hair_style || "ไม่ได้ระบุ"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if(confirm(`ยืนยันการยกเลิกคิวของคุณ ${booking.name} หรือไม่?`)) {
                          toggleSlot(booking.time, booking);
                        }
                      }}
                      className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                    >
                      ยกเลิกคิว
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium">ยังไม่มีลูกค้าจองคิวในวันที่เลือกครับ 😊</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}