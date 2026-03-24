"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

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
      Swal.fire({
        title: "ข้อมูลไม่ครบ",
        text: "โปรดเลือกทรงผมหรือระบุทรงผมที่ต้องการ",
        icon: "warning",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-[2.5rem]" }
      });
      return;
    }
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      await Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนจึงจะจองคิวได้",
        icon: "info",
        confirmButtonText: "ไปหน้าล็อกอิน",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-[2.5rem]" }
      });
      router.push("/login");
      setLoading(false);
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
      Swal.fire({
        title: "จองไม่สำเร็จ",
        text: "เวลานี้อาจถูกจองไปแล้ว โปรดลองเลือกเวลาอื่น",
        icon: "error",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-[2.5rem]" }
      });
    } else {
      await sendLineNotify(name, date, time, finalStyle);
      
      await Swal.fire({
        title: "จองคิวสำเร็จ!",
        text: "เราได้ส่งแจ้งเตือนไปที่ช่างเรียบร้อยแล้ว",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2.5rem]" }
      });
      router.push("/my-bookings");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] py-12 px-6 selection:bg-blue-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 blur-[120px] rounded-full"></div>

      <div className="max-w-3xl mx-auto relative z-10 animate-fade-in">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            ← ย้อนกลับ
          </Link>
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            Step by Step Booking
          </div>
        </header>

        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-8 md:p-16 border border-slate-200/50">
          <div className="mb-14 text-center">
            <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase mb-3">จองคิวตัดผม<span className="text-blue-600">.</span></h1>
            <p className="text-slate-400 font-medium text-sm">ระบุข้อมูลของคุณและเลือกเวลาที่สะดวก</p>
          </div>
          
          <form onSubmit={handleBooking} className="space-y-16">
            {/* STEP 1 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">01</span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">ข้อมูลผู้ติดต่อ</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                  <input type="text" placeholder="ระบุชื่อของคุณ" required className="w-full p-5 bg-[#fcfcfc] rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200" onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                  <input type="tel" placeholder="08X-XXX-XXXX" required className="w-full p-5 bg-[#fcfcfc] rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium placeholder:text-slate-200" onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </section>

            {/* STEP 2 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">02</span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">เลือกสไตล์ผม</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STYLES.map(style => (
                  <div 
                    key={style.id}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`group cursor-pointer p-3 rounded-[2rem] border-2 transition-all duration-500 ${selectedStyle === style.name ? 'border-blue-600 bg-white shadow-xl shadow-blue-100 scale-[1.02]' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="relative overflow-hidden rounded-[1.5rem] aspect-square mb-3">
                      <img src={style.img} className={`w-full h-full object-cover transition-transform duration-700 ${selectedStyle === style.name ? 'scale-110' : 'group-hover:scale-110'}`} alt={style.name} />
                    </div>
                    <p className={`text-center text-[10px] font-black uppercase tracking-widest ${selectedStyle === style.name ? 'text-blue-600' : 'text-slate-500'}`}>{style.name}</p>
                  </div>
                ))}
                <div 
                  onClick={() => setSelectedStyle("อื่นๆ")}
                  className={`cursor-pointer p-3 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center aspect-square ${selectedStyle === "อื่นๆ" ? 'border-blue-600 bg-white shadow-xl shadow-blue-100 scale-[1.02]' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className="text-2xl mb-2">✂️</div>
                  <p className={`text-center text-[10px] font-black uppercase tracking-widest ${selectedStyle === "อื่นๆ" ? 'text-blue-600' : 'text-slate-500'}`}>ระบุเอง</p>
                </div>
              </div>
              
              {selectedStyle === "อื่นๆ" && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                   <input type="text" placeholder="ระบุทรงผมที่คุณต้องการ..." required className="w-full p-5 bg-white border-2 border-blue-600/20 rounded-2xl outline-none focus:border-blue-600 font-bold transition-all shadow-lg shadow-blue-500/5" onChange={e => setCustomStyle(e.target.value)} />
                </div>
              )}
            </section>

            {/* STEP 3 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">03</span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">วันและเวลา</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกวันที่</label>
                  <input type="date" required min={today} className="w-full p-5 bg-[#fcfcfc] rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-black uppercase" onChange={e => { setDate(e.target.value); setTime(""); }} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกเวลา</label>
                  <div className="relative">
                    <select 
                      required 
                      value={time}
                      disabled={!date}
                      className="w-full p-5 bg-[#fcfcfc] rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-black appearance-none cursor-pointer disabled:opacity-30" 
                      onChange={e => setTime(e.target.value)}
                    >
                      <option value="">{date ? "SELECT TIME" : "CHOOSE DATE FIRST"}</option>
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <option key={slot} value={slot} disabled={isBooked} className="font-sans">
                            {slot} {isBooked ? "— FULL" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-[10px]">▼</div>
                  </div>
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={loading || !time} 
              className="group relative w-full bg-slate-950 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-slate-950/20 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 transition-all text-sm uppercase tracking-[0.3em] overflow-hidden"
            >
              <span className="relative z-10">{loading ? "PROCESSING..." : "CONFIRM BOOKING"}</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>
        </div>

        <footer className="mt-16 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">BARBER SHOP STUDIO — BOOKING SYSTEM</p>
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