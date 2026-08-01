"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Swal from "sweetalert2";
import { 
  Calendar, 
  Clock, 
  Scissors, 
  XCircle, 
  CheckCircle2, 
  Hourglass, 
  Plus, 
  ArrowLeft, 
  Home, 
  ListOrdered,
  PlusCircle,
  AlertCircle
} from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("booking_date", { ascending: false });

        if (!error) setBookings(data || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, bookingDate: string, bookingTime: string, hairStyle: string) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "ต้องการยกเลิกคิวนี้?",
      text: "กรุณาระบุเหตุผลในการยกเลิกสั้นๆ ให้เราทราบ",
      input: "text",
      inputPlaceholder: "ระบุสาเหตุ (เช่น ติดภารกิจด่วน, ป่วย ฯลฯ)...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // Red-600
      cancelButtonColor: "#f1f5f9",
      confirmButtonText: "ยืนยันการยกเลิก",
      cancelButtonText: "กลับก่อน",
      customClass: {
        popup: "rounded-3xl border border-slate-100 shadow-2xl",
        input: "rounded-xl border-slate-200 bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-blue-600/20",
        cancelButton: "text-slate-600 font-bold rounded-xl",
        confirmButton: "font-bold rounded-xl"
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
          title: "ยกเลิกคิวเรียบร้อย",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-3xl" }
        });
        fetchBookings();
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">กำลังโหลดรายการจอง...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      {/* --- Top App Header --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="brand-logo">BARBER.APP</span>

          <div className="flex items-center gap-3">
            <Link 
              href="/booking" 
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> จองคิวใหม่
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" /> หน้าแรก
            </Link>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold mb-2">
            ประวัติและสถานะ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            รายการจองคิวของคุณ
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            ตรวจสอบสถานะ หรือดำเนินการยกเลิกคิวที่อยู่ระหว่างการรอได้ที่นี่
          </p>
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 text-center my-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">ยังไม่มีรายการจองคิว</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
              คุณยังไม่ได้ทำรายการจองคิวตัดผม สามารถจองวันและเวลาที่คุณสะดวกได้ทันที
            </p>
            <Link 
              href="/booking" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> จองคิวตอนนี้เลย
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Information */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 text-slate-700 rounded-xl mt-0.5 hidden sm:block">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[11px] px-2.5 py-0.5 rounded-md">
                        {item.hair_style}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-slate-900">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{item.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{item.booking_time} น.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Status Badges */}
                  {item.status === 'confirmed' && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> ยืนยันเรียบร้อย
                    </div>
                  )}

                  {item.status === 'rejected' && (
                    <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                      <AlertCircle className="w-4 h-4" /> ถูกปฏิเสธคิว
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                      <Hourglass className="w-4 h-4 animate-pulse" /> รอร้านยืนยัน
                    </div>
                  )}

                  {/* Cancel Button (Only show on pending status) */}
                  {item.status === 'pending' && (
                    <button 
                      onClick={() => handleCancel(item.id, item.booking_date, item.booking_time, item.hair_style)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      title="ยกเลิกคิวนี้"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>ยกเลิกคิว</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- Mobile Bottom Navigation Bar --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-2 z-50 flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 font-medium text-[10px]">
          <Home className="w-5 h-5" />
          <span>หน้าแรก</span>
        </Link>
        <Link href="/booking" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 font-medium text-[10px]">
          <PlusCircle className="w-5 h-5" />
          <span>จองคิว</span>
        </Link>
        <Link href="/my-bookings" className="flex flex-col items-center gap-1 text-blue-600 font-bold text-[10px]">
          <ListOrdered className="w-5 h-5" />
          <span>คิวของฉัน</span>
        </Link>
      </div>
    </div>
  );
}