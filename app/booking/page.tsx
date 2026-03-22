"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STYLES = [
  { id: "undercut", name: "Undercut", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200" },
  { id: "mullet", name: "Mullet", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=200" },
  { id: "buzzcut", name: "Buzz Cut", img: "https://images.unsplash.com/photo-1593702295094-ada74bc19ef9?q=80&w=200" },
];

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

export default function BookingPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  // --- 🚩 ฟังก์ชันส่งแจ้งเตือนไปที่ LINE ---
  const sendLineNotify = async (customerName: string, bookingDate: string, bookingTime: string, hairStyle: string) => {
    try {
      const message = `\n📢 มีคิวจองใหม่เข้ามาครับ!\n👤 ลูกค้า: ${customerName}\n📅 วันที่: ${bookingDate}\n⏰ เวลา: ${bookingTime} น.\n💇‍♂️ ทรงผม: ${hairStyle}`;
      
      await fetch("/api/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    } catch (err) {
      console.error("LINE Notify Error:", err);
    }
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!date) return;
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", date)
        .neq("status", "rejected");

      if (data) setBookedSlots(data.map(item => item.booking_time));
      if (error) console.error("Error fetching slots:", error);
    };
    fetchBookedSlots();
  }, [date]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStyle = selectedStyle === "อื่นๆ" ? customStyle : selectedStyle;

    if (!finalStyle) {
      alert("โปรดเลือกทรงผมหรือระบุทรงผมที่ต้องการ");
      return;
    }
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนจองคิว");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("bookings").insert([{ 
      user_id: user.id, 
      booking_date: date, 
      booking_time: time,
      customer_name: name,
      phone: phone,
      hair_style: finalStyle,
      status: "pending"
    }]);

    if (error) {
      alert("จองไม่สำเร็จ: เวลานี้อาจถูกจองไปแล้ว โปรดลองเลือกเวลาอื่น");
    } else {
      // ✅ จองสำเร็จ -> ส่ง LINE ทันที
      await sendLineNotify(name, date, time, finalStyle);
      
      alert("จองคิวสำเร็จแล้ว! ระบบได้ส่งแจ้งเตือนไปที่ช่างแล้วครับ");
      router.push("/my-bookings");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      {/* UI ส่วนที่เหลือคงเดิมตามที่คุณส่งมา */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
          ← กลับหน้าแรก
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">จองคิวตัดผม</h1>
          <p className="text-slate-500 mt-2">เลือกเวลาที่สะดวกได้ตั้งแต่ 10:00 - 21:00 น.</p>
        </div>
        
        <form onSubmit={handleBooking} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">1. ข้อมูลผู้ติดต่อ</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="ชื่อของคุณ" required className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setName(e.target.value)} />
              <input type="tel" placeholder="เบอร์โทรศัพท์" required className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">2. เลือกทรงผม</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STYLES.map(style => (
                <div 
                  key={style.id}
                  onClick={() => setSelectedStyle(style.name)}
                  className={`cursor-pointer p-2 rounded-2xl border-2 transition-all ${selectedStyle === style.name ? 'border-blue-600 bg-blue-50 scale-[1.02]' : 'border-transparent bg-slate-50'}`}
                >
                  <img src={style.img} className="rounded-xl mb-2 w-full h-24 object-cover" alt={style.name} />
                  <p className="text-center text-xs font-bold text-slate-700">{style.name}</p>
                </div>
              ))}
              <div 
                onClick={() => setSelectedStyle("อื่นๆ")}
                className={`cursor-pointer p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center min-h-[136px] ${selectedStyle === "อื่นๆ" ? 'border-blue-600 bg-blue-50 scale-[1.02]' : 'border-transparent bg-slate-50'}`}
              >
                <div className="text-2xl mb-1">✍️</div>
                <p className="text-center text-xs font-bold text-slate-700">ระบุเอง</p>
              </div>
            </div>
            {selectedStyle === "อื่นๆ" && (
              <input type="text" placeholder="ระบุทรงผมที่ต้องการ..." required className="w-full p-4 bg-white border-2 border-blue-200 rounded-2xl outline-none focus:border-blue-600 animate-in fade-in" onChange={e => setCustomStyle(e.target.value)} />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">3. วันและเวลาที่สะดวก</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="date" 
                required 
                min={today}
                className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500" 
                onChange={e => {
                    setDate(e.target.value);
                    setTime("");
                }} 
              />
              
              <div className="relative">
                <select 
                  required 
                  value={time}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50" 
                  onChange={e => setTime(e.target.value)}
                  disabled={!date}
                >
                  <option value="">{date ? "-- เลือกเวลา --" : "กรุณาเลือกวันที่ก่อน"}</option>
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <option key={slot} value={slot} disabled={isBooked}>
                        {slot} น. {isBooked ? "(เต็ม/ปิดรับคิว)" : ""}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !time} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการจองคิว"}
          </button>
        </form>
      </div>
    </main>
  );
}