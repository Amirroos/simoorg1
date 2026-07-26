import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileSearch, Package, Send, ShieldCheck, ShoppingCart, Store } from "lucide-react";
import { useApp, type RFQ } from "../contexts/AppContext";
import { formatPriceToman } from "../data/products";
import { formatPersianDate } from "../utils/persianDate";

const statusLabel: Record<RFQ["status"], string> = {
  pending_admin: "در انتظار بررسی ادمین فروش",
  open: "در حال دریافت استعلام تأمین‌کنندگان",
  offer_ready: "پیشنهاد تأییدشده آماده بررسی شماست",
  buyer_approved: "تأیید و خرید انجام شد",
  published: "پیشنهاد منتشرشده",
  closed: "بسته‌شده",
};

export function BuyerRFQs() {
  const { user, rfqs, confirmRFQPurchase } = useApp();
  const [addressByRFQ, setAddressByRFQ] = useState<Record<string, string>>({});
  const [errorByRFQ, setErrorByRFQ] = useState<Record<string, string>>({});
  const myRfqs = user ? rfqs.filter((rfq) => rfq.buyerId === user.id) : [];

  if (!user) return null;

  const confirmPurchase = (rfq: RFQ) => {
    const address = addressByRFQ[rfq.id] || user.address || "";
    if (!address.trim()) {
      setErrorByRFQ((current) => ({ ...current, [rfq.id]: "آدرس تحویل را وارد کنید." }));
      return;
    }
    if (!confirm("پیشنهاد تأیید و سفارش خرید با مبلغ نمایش‌داده‌شده ثبت شود؟")) return;
    const order = confirmRFQPurchase(rfq.id, address);
    if (!order) setErrorByRFQ((current) => ({ ...current, [rfq.id]: "ثبت خرید انجام نشد. دوباره تلاش کنید." }));
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-950 md:text-3xl"><FileSearch className="h-8 w-8 text-cyan-600" /> درخواست‌های کالای من</h1>
            <p className="mt-1 text-sm text-slate-500">پیگیری از بررسی ادمین تا پیشنهاد اختصاصی و خرید</p>
          </div>
          <Link to="/product-request" className="rounded-xl bg-cyan-700 px-4 py-2.5 text-center text-sm font-black text-white">ثبت درخواست جدید</Link>
        </div>

        {myRfqs.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-sm"><FileSearch className="mx-auto mb-4 h-12 w-12 text-slate-300" /><h3 className="text-xl font-black">هنوز درخواستی ثبت نکرده‌اید</h3><p className="mt-2 text-sm text-slate-500">از تب «ثبت درخواست» جست‌وجو را شروع کنید.</p></div>
        ) : (
          <div className="space-y-5">
            {myRfqs.map((rfq, index) => {
              const selectedBid = rfq.bids.find((bid) => bid.id === rfq.selectedBidId);
              const currentStep = rfq.status === "pending_admin" ? 0 : rfq.status === "open" ? 1 : rfq.status === "offer_ready" || rfq.status === "published" ? 2 : rfq.status === "buyer_approved" ? 3 : 0;
              return (
                <motion.article key={rfq.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <header className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-start">
                    <div><div className="mb-1 flex items-center gap-2"><span dir="ltr" className="text-xs font-black text-cyan-700">{rfq.id}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">{statusLabel[rfq.status]}</span></div><h2 className="text-lg font-black text-slate-950">{rfq.title}</h2><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {formatPersianDate(rfq.createdAt)}</div></div>
                    {rfq.orderId && <Link to="/orders" dir="ltr" className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">{rfq.orderId}</Link>}
                  </header>

                  <div className="p-5">
                    <div className="mb-6 grid grid-cols-4 gap-2">
                      {[{ icon: ShieldCheck, label: "بررسی فروش" }, { icon: Store, label: "استعلام تأمین" }, { icon: Send, label: "پیشنهاد منتخب" }, { icon: ShoppingCart, label: "تأیید و خرید" }].map((item, step) => {
                        const Icon = item.icon;
                        return <div key={item.label} className={`relative rounded-2xl px-2 py-3 text-center ${step <= currentStep ? "bg-cyan-50 text-cyan-800" : "bg-slate-100 text-slate-400"}`}><Icon className="mx-auto mb-1 h-4 w-4" /><div className="text-[10px] font-black sm:text-xs">{item.label}</div>{step < currentStep && <CheckCircle2 className="absolute left-1 top-1 h-3.5 w-3.5 text-emerald-600" />}</div>;
                      })}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <section>
                        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-black text-slate-800"><Package className="h-4 w-4 text-cyan-600" /> مشخصات درخواست</h3>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6 text-slate-600"><div className="font-black text-slate-900">{rfq.items[0]?.name}</div><div>تعداد: {rfq.items[0]?.qty.toLocaleString("fa-IR")} {rfq.items[0]?.unit}</div><div>برند: {rfq.brand || "بدون ترجیح"} · مدل: {rfq.model || "نامشخص"}</div><div>محل تحویل: {rfq.deliveryLocation || "-"}</div>{rfq.items[0]?.specs && <p className="mt-2 border-t border-slate-200 pt-2">{rfq.items[0].specs}</p>}</div>
                      </section>

                      <section>
                        {currentStep < 2 ? (
                          <div className="flex h-full min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center"><Clock className="mb-2 h-7 w-7 text-amber-500" /><div className="text-sm font-black text-slate-800">{currentStep === 0 ? "در حال بررسی مشخصات" : "در حال دریافت و ارزیابی استعلام‌ها"}</div><p className="mt-1 text-xs leading-6 text-slate-500">قیمت و نام تأمین‌کنندگان تا انتخاب نهایی ادمین فروش برای شما نمایش داده نمی‌شود.</p></div>
                        ) : selectedBid ? (
                          <div className={`rounded-2xl border p-4 ${rfq.status === "buyer_approved" ? "border-emerald-200 bg-emerald-50" : "border-cyan-200 bg-cyan-50"}`}>
                            <div className="flex items-center gap-2 text-xs font-black text-cyan-800"><CheckCircle2 className="h-4 w-4" /> پیشنهاد تأییدشده سیمرغ تأمین دریا</div>
                            <div className="mt-3 text-2xl font-black text-emerald-700">{formatPriceToman(rfq.finalPrice || selectedBid.price)}</div>
                            <p className="mt-2 text-xs leading-6 text-slate-600">{rfq.adminNote || selectedBid.description || "پیشنهاد پس از بررسی تیم فروش برای شما منتشر شده است."}</p>
                            {rfq.status === "offer_ready" || rfq.status === "published" ? (
                              <div className="mt-4 space-y-2 border-t border-cyan-200 pt-4">
                                <label className="block text-xs font-black text-slate-700">آدرس نهایی تحویل</label>
                                <textarea value={addressByRFQ[rfq.id] ?? user.address ?? ""} onChange={(event) => setAddressByRFQ((current) => ({ ...current, [rfq.id]: event.target.value }))} className="input-shell min-h-20" placeholder="آدرس کامل تحویل" />
                                {errorByRFQ[rfq.id] && <div className="text-xs font-bold text-rose-600">{errorByRFQ[rfq.id]}</div>}
                                <button onClick={() => confirmPurchase(rfq)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700"><ShoppingCart className="h-4 w-4" /> تأیید پیشنهاد و انجام خرید</button>
                              </div>
                            ) : (
                              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" /> خرید ثبت شد؛ ادامه وضعیت را در سفارش‌های من ببینید.</div>
                            )}
                          </div>
                        ) : <div className="rounded-2xl bg-slate-50 p-5 text-xs text-slate-500">پیشنهاد منتخب در دسترس نیست.</div>}
                      </section>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
