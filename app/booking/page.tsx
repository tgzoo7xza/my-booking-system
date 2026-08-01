"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { 
  User, 
  Phone, 
  Scissors, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Check, 
  Home, 
  ListOrdered, 
  PlusCircle,
  AlertCircle
} from "lucide-react";

const STYLES = [
  { 
    id: "Two block Undercut", 
    name: "Two block Undercut", 
    img: "/Two block Undercut.jpg" 
  },
  { 
    id: "Comma Hair", 
    name: "Comma Hair", 
    img: "/Comma Hair.jpg" 
  },
  { 
    id: "Modern Mullet", 
    name: "Modern Mullet", 
    img: "/Modern Mullet.jpg" 
  },

  { 
    id: "Middle Part", 
    name: "Middle Part", 
    img: "/Middle Part.jpg" 
  },
  { 
    id: " Buzz Cut", 
    name: " Buzz Cut", 
    img: "/Buzz Cut.jpg" 
  },
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
  
  const today = new Intl.DateTimeFormat('fr-CA', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(new Date());

  const isSlotPast = (slotTime: string) => {
    if (!date) return false;
    if (date !== today) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [slotHour, slotMinute] = slotTime.split(":").map(Number);

    if (slotHour < currentHour) {
      return true;
    } else if (slotHour === currentHour && slotMinute <= currentMinute) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
      if (user?.user_metadata?.phone) {
        setPhone(user.user_metadata.phone);
      }
    };
    checkUser();
  }, []);

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStyle = selectedStyle === "อื่นๆ" ? customStyle : selectedStyle;

    if (!finalStyle) {
      Swal.fire({
        title: "กรุณาเลือกทรงผม",
        text: "โปรดเลือกทรงผมจากรายการหรือระบุทรงผมที่ต้องการ",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
      return;
    }

    if (!time) {
      Swal.fire({
        title: "กรุณาเลือกเวลา",
        text: "โปรดเลือกช่วงเวลาที่ต้องการเข้ารับบริการ",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
      return;
    }

    if (isSlotPast(time)) {
      Swal.fire({
        title: "เวลาเลยกำหนดแล้ว",
        text: "ช่วงเวลานี้เลยเวลาปัจจุบันไปแล้ว โปรดเลือกช่วงเวลาถัดไป",
        icon: "error",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
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
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
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
        title: "จองคิวไม่สำเร็จ",
        text: "เวลานี้อาจถูกจองไปแล้ว โปรดเลือกช่วงเวลาอื่น",
        icon: "error",
        confirmButtonColor: "#0f172a",
        customClass: { popup: "rounded-3xl" }
      });
    } else {
      await sendLineNotify(name, date, time, finalStyle);
      
      await Swal.fire({
        title: "จองคิวสำเร็จ!",
        text: "ระบบได้รับการจองคิวของคุณเรียบร้อยแล้ว",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { 
          popup: "rounded-3xl border border-slate-100 shadow-2xl",
          title: "font-black text-slate-900",
          htmlContainer: "font-medium text-slate-500"
        }
      });
      router.push("/my-bookings");
    }
    setLoading(false);
  };

  return (
    <div className="booking-page-container">
      {/* Top App Header */}
      <header className="booking-header">
        <div className="booking-header-inner">
          <span className="brand-logo">BARBER.APP</span>
          <Link href="/" className="btn-nav-back">
            <ArrowLeft className="w-4 h-4" /> หน้าแรก
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div className="booking-badge">
            จองคิวรับบริการ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ทำการจองคิวตัดผม
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            ระบุรายละเอียดผู้ติดต่อ เลือกสไตล์ทรงผม และระบุรอบเวลาที่คุณสะดวก
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          {/* STEP 1: CONTACT INFO */}
          <section className="booking-section-card">
            <div className="section-header-title">
              <span className="step-number-badge">1</span>
              <h2 className="text-base font-bold text-slate-900">ข้อมูลผู้ติดต่อ</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> ชื่อ-นามสกุล
                </label>
                <input 
                  type="text" 
                  placeholder="ระบุชื่อของคุณ" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)} 
                  className="form-input-field" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> เบอร์โทรศัพท์
                </label>
                <input 
                  type="tel" 
                  placeholder="08X-XXX-XXXX" 
                  required 
                  value={phone}
                  onChange={e => setPhone(e.target.value)} 
                  className="form-input-field" 
                />
              </div>
            </div>
          </section>

          {/* STEP 2: HAIR STYLE */}
          <section className="booking-section-card">
            <div className="section-header-title">
              <span className="step-number-badge">2</span>
              <h2 className="text-base font-bold text-slate-900">เลือกทรงผมที่ต้องการ</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STYLES.map(style => {
                const isSelected = selectedStyle === style.name;
                return (
                  <div 
                    key={style.id}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`style-option-card ${isSelected ? 'style-option-active' : 'style-option-inactive'}`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                      <img 
                        src={style.img} 
                        alt={style.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white p-1 rounded-full shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                      {style.name}
                    </span>
                  </div>
                );
              })}

              <div 
                onClick={() => setSelectedStyle("อื่นๆ")}
                className={`style-option-card flex flex-col items-center justify-center aspect-square ${
                  selectedStyle === "อื่นๆ" ? 'style-option-active' : 'style-option-inactive'
                }`}
              >
                <div className="p-2.5 bg-white text-slate-700 rounded-full shadow-sm mb-1.5">
                  <Scissors className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`text-xs font-bold ${selectedStyle === "อื่นๆ" ? 'text-blue-600' : 'text-slate-700'}`}>
                  ระบุเอง
                </span>
              </div>
            </div>

            {selectedStyle === "อื่นๆ" && (
              <div className="pt-2">
                <input 
                  type="text" 
                  placeholder="ระบุชื่อทรงผมหรือรายละเอียดที่ต้องการ..." 
                  required 
                  value={customStyle}
                  onChange={e => setCustomStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-500 bg-white outline-none focus:ring-2 focus:ring-blue-600/20 text-sm font-medium" 
                />
              </div>
            )}
          </section>

          {/* STEP 3: DATE & TIME */}
          <section className="booking-section-card">
            <div className="section-header-title">
              <span className="step-number-badge">3</span>
              <h2 className="text-base font-bold text-slate-900">เลือกวันและเวลา</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> เลือกวันที่
              </label>
              <input 
                type="date" 
                required 
                min={today} 
                value={date}
                onChange={e => { setDate(e.target.value); setTime(""); }}
                className="form-input-field font-bold text-slate-800" 
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between ml-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> เลือกรอบเวลา
                </span>
                {!date && (
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> กรุณาเลือกวันที่ก่อน
                  </span>
                )}
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isPast = isSlotPast(slot);
                  const isDisabled = !date || isBooked || isPast;
                  const isSelected = time === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setTime(slot)}
                      className={`time-slot-btn ${
                        isSelected
                          ? 'time-slot-selected'
                          : isDisabled
                          ? 'time-slot-disabled'
                          : 'time-slot-active'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading || !time || !date} 
            className="btn-submit-booking"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังทำรายการจอง...</span>
              </>
            ) : (
              <span>ยืนยันการจองคิว</span>
            )}
          </button>
        </form>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <Link href="/" className="nav-item-inactive">
          <Home className="w-5 h-5" />
          <span>หน้าแรก</span>
        </Link>
        <Link href="/booking" className="nav-item-active">
          <PlusCircle className="w-5 h-5" />
          <span>จองคิว</span>
        </Link>
        <Link href="/my-bookings" className="nav-item-inactive">
          <ListOrdered className="w-5 h-5" />
          <span>คิวของฉัน</span>
        </Link>
      </div>
    </div>
  );
}