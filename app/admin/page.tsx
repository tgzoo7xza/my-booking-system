"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  LogOut, 
  RefreshCw, 
  Users, 
  Server,
  AlertCircle
} from "lucide-react";

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

export default function AdminPage() {
  const router = useRouter();
  
  // Format วันที่ปัจจุบัน YYYY-MM-DD
  const today = new Intl.DateTimeFormat('fr-CA', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(new Date());

  const [date, setDate] = useState(today);

  const [bookedSlots, setBookedSlots] = useState<{
    id?: string,
    time: string, 
    status: string, 
    name: string,
    phone?: string,
    hair_style?: string
  }[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันเช็กว่าสล็อตเวลานั้นเลยเวลา Real-time ไปแล้วหรือยัง
  const isSlotPast = (slotTime: string) => {
    if (!date) return false;
    
    // ถ้าวันที่เลือก ไม่ใช่ วันนี้ (เช่น ดูย้อนหลัง หรือดูอนาคต)
    if (date < today) return true; // วันที่ผ่านมาแล้ว = เลยเวลาทั้งหมด
    if (date > today) return false; // วันอนาคต = ยังไม่ถึงเวลา

    // กรณีเป็นวันที่ปัจจุบัน
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

  // 1. Check Admin Auth
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = "fortune02548@gmail.com"; 

      if (!session || session.user.email !== adminEmail) {
        Swal.fire({
          title: "ปฏิเสธการเข้าถึง",
          text: "เฉพาะผู้ดูแลร้านเท่านั้นที่สามารถเข้าถึงหน้านี้ได้",
          icon: "error",
          confirmButtonColor: "#2563eb",
          customClass: { popup: "rounded-3xl" }
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
        .select("id, booking_time, status, customer_name, phone, hair_style")
        .eq("booking_date", date)
        .neq("status", "rejected");
      
      if (error) throw error;
      setBookedSlots(data?.map(d => ({
        id: d.id,
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

  // Update Status (Confirm / Reject)
  const handleUpdateStatus = async (id: string, newStatus: "confirmed" | "rejected") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      Swal.fire({
        title: newStatus === "confirmed" ? "อนุมัติคิวเรียบร้อย" : "ปฏิเสธคิวเรียบร้อย",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" }
      });

      fetchSlots();
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };

  const toggleSlot = async (time: string, currentBooking?: any) => {
    if (isSlotPast(time) && !currentBooking) {
      Swal.fire({
        title: "ไม่สามารถดำเนินการได้",
        text: "ช่วงเวลานี้ผ่านไปแล้ว ไม่สามารถเปลี่ยนสถานะได้",
        icon: "info",
        confirmButtonColor: "#2563eb",
        customClass: { popup: "rounded-3xl" }
      });
      return;
    }

    if (currentBooking && currentBooking.status !== "blocked") {
      const result = await Swal.fire({
        title: "ยืนยันการยกเลิก/ลบคิว?",
        text: `คุณต้องการลบคิวของคุณ ${currentBooking.name} หรือไม่?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#f1f5f9",
        confirmButtonText: "ลบคิวนี้",
        cancelButtonText: "ยกเลิก",
        customClass: { 
          popup: "rounded-3xl border border-slate-100 shadow-2xl",
          cancelButton: "text-slate-600 font-bold rounded-xl",
          confirmButton: "font-bold rounded-xl"
        }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold text-slate-400">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</span>
    </div>
  );

  const customerCount = bookedSlots.filter(b => b.status !== 'blocked').length;
  const blockedCount = bookedSlots.filter(b => b.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <div className="bg-blue-600 text-white p-1.5 rounded-xl shadow-md shadow-blue-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <span>BARBER<span className="text-blue-600">.ADMIN</span></span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchSlots}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Server className="w-3.5 h-3.5" /> ระบบจัดการหลังบ้าน
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              แดชบอร์ดผู้ดูแลร้าน
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="px-2 py-1.5 bg-transparent font-bold text-xs sm:text-sm outline-none text-slate-800"
            />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">คิวจองประจำเป็นวัน</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{customerCount} <span className="text-xs font-normal text-slate-500">คิว</span></h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">ช่วงเวลาปิดรับ</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{blockedCount} <span className="text-xs font-normal text-slate-500">รอบ</span></h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-200">
              <Ban className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">สถานะระบบ</p>
              <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                ออนไลน์ปกติ
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Server className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TIME SLOT MANAGER GRID */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> จัดการตารางเวลารับคิว
            </h2>
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              คลิกเพื่อสลับสถานะ ปิด/เปิด หรือ ลบคิว
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {TIME_SLOTS.map(slot => {
              const booking = bookedSlots.find(b => b.time === slot);
              const isBlocked = booking?.status === "blocked";
              const isCustomer = booking && !isBlocked;
              const isPast = isSlotPast(slot);

              return (
                <button
                  key={slot}
                  disabled={isPast && !booking} // ถ้าเลยเวลาไปแล้วและไม่มีคิว ให้กดไม่ได้
                  onClick={() => toggleSlot(slot, booking)}
                  className={`p-3 rounded-2xl transition-all border text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    isCustomer 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm' 
                      : isBlocked 
                      ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                      : isPast
                      ? 'bg-slate-100/60 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{slot}</span>
                  <span className="text-[10px] opacity-80">
                    {isCustomer ? "จองแล้ว" : isBlocked ? "ปิดรับ" : isPast ? "เลยเวลา" : "ว่าง"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOMER BOOKINGS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> รายชื่อลูกค้าที่จองคิว
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {customerCount} รายการ
            </span>
          </div>

          <div className="space-y-3">
            {bookedSlots.filter(b => b.status !== 'blocked').length > 0 ? (
              bookedSlots
                .filter(b => b.status !== 'blocked')
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((booking) => {
                  const isPast = isSlotPast(booking.time);

                  return (
                    <div 
                      key={booking.id || booking.time} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPast ? 'bg-slate-50/80 border-slate-200 opacity-75' : 'bg-slate-50/50 border-slate-200/80 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm ${
                          isPast ? 'bg-slate-400 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{booking.time} น.</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{booking.name}</h3>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                              {booking.hair_style}
                            </span>
                            {isPast && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                ผ่านไปแล้ว
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {booking.phone}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`font-bold ${
                              booking.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {booking.status === 'confirmed' ? 'อนุมัติแล้ว' : 'รอการยืนยัน'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                        {booking.status === 'pending' && booking.id && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id!, "confirmed")}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติ
                          </button>
                        )}
                        
                        <button 
                          onClick={() => toggleSlot(booking.time, booking)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> ยกเลิก/ลบ
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-xs">ยังไม่มีรายการจองคิวในวันที่เลือก</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}