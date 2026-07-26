import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  PackageCheck,
  Send,
  ShoppingCart,
  Store,
  UserRound,
} from "lucide-react";
import { useApp, type RFQ } from "../../contexts/AppContext";
import { formatPriceToman, productGroups } from "../../data/products";
import { formatPersianDate } from "../../utils/persianDate";

const statusMeta: Record<RFQ["status"], { label: string; className: string }> = {
  pending_admin: { label: "در انتظار بررسی فروش", className: "bg-amber-100 text-amber-800" },
  open: { label: "در کارتابل تأمین‌کنندگان", className: "bg-purple-100 text-purple-800" },
  offer_ready: { label: "پیشنهاد منتشرشده برای خریدار", className: "bg-cyan-100 text-cyan-800" },
  buyer_approved: { label: "تأیید خریدار و خرید", className: "bg-emerald-100 text-emerald-800" },
  published: { label: "منتشرشده", className: "bg-cyan-100 text-cyan-800" },
  closed: { label: "بسته‌شده", className: "bg-slate-100 text-slate-700" },
};

export function AdminRFQs() {
  const { rfqs, forwardRFQToSuppliers, selectRFQBid } = useApp();
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(rfqs[0]?.id || null);
  const [finalPrices, setFinalPrices] = useState<Record<string, number>>({});
  const [adminNote, setAdminNote] = useState("");
  const selected = rfqs.find((rfq) => rfq.id === selectedRFQ) || null;

  const stats = useMemo(() => ({
    review: rfqs.filter((rfq) => rfq.status === "pending_admin").length,
    sourcing: rfqs.filter((rfq) => rfq.status === "open").length,
    released: rfqs.filter((rfq) => rfq.status === "offer_ready").length,
    bought: rfqs.filter((rfq) => rfq.status === "buyer_approved").length,
  }), [rfqs]);

  const approveBid = (rfq: RFQ, bidId: string, supplierPrice: number) => {
    const finalPrice = finalPrices[bidId] || supplierPrice;
    if (finalPrice < supplierPrice) {
      alert("قیمت نهایی نمی‌تواند کمتر از قیمت تأمین‌کننده باشد.");
      return;
    }
    if (!confirm("این پیشنهاد فقط برای خریدار همین درخواست منتشر شود؟")) return;
    selectRFQBid(rfq.id, bidId, finalPrice, adminNote);
    setAdminNote("");
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-950">کارتابل درخواست کالا و استعلام‌ها</h1>
        <p className="mt-1 text-sm text-slate-500">بررسی درخواست خریدار، ارجاع برای تأمین و انتشار کنترل‌شده پیشنهاد منتخب</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="نیازمند بررسی" value={stats.review} tone="amber" />
        <Stat icon={Store} label="در حال استعلام" value={stats.sourcing} tone="purple" />
        <Stat icon={Send} label="منتظر خریدار" value={stats.released} tone="cyan" />
        <Stat icon={ShoppingCart} label="تبدیل به خرید" value={stats.bought} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-3">
          {rfqs.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-20 text-center text-slate-500">درخواستی وجود ندارد</div>
          ) : rfqs.map((rfq, index) => {
            const status = statusMeta[rfq.status] || statusMeta.open;
            const selectedCard = selectedRFQ === rfq.id;
            return (
              <motion.button
                key={rfq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedRFQ(rfq.id)}
                className={`w-full rounded-2xl border bg-white p-4 text-right transition ${selectedCard ? "border-cyan-400 ring-4 ring-cyan-50" : "border-slate-200 hover:border-cyan-200"}`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span dir="ltr" className="text-xs font-black text-slate-500">{rfq.id}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black ${status.className}`}>{status.label}</span>
                    </div>
                    <h3 className="truncate font-black text-slate-900">{rfq.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>خریدار: {rfq.buyerName}</span>
                      <span>{rfq.items[0]?.qty.toLocaleString("fa-IR")} {rfq.items[0]?.unit}</span>
                      <span>{rfq.bids.length.toLocaleString("fa-IR")} پیشنهاد</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700"><Eye className="h-4 w-4" /> بررسی</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <aside className="self-start xl:sticky xl:top-24">
          {!selected ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400"><Eye className="mx-auto mb-3 h-10 w-10" />یک درخواست را انتخاب کنید</div>
          ) : (
            <motion.div key={selected.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="bg-gradient-to-l from-slate-950 to-cyan-950 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div><div dir="ltr" className="text-xs font-bold text-cyan-300">{selected.id}</div><h2 className="mt-1 font-black">{selected.title}</h2></div>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-black ${statusMeta[selected.status]?.className}`}>{statusMeta[selected.status]?.label}</span>
                </div>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info label="خریدار" value={selected.buyerName} icon={UserRound} />
                  <Info label="تاریخ ثبت" value={formatPersianDate(selected.createdAt)} icon={FileSearch} />
                  <Info label="گروه" value={productGroups.find((group) => group.id === selected.productGroupId)?.name || "-"} icon={PackageCheck} />
                  <Info label="نوع شناور" value={selected.vesselType || "-"} icon={AnchorIcon} />
                </div>

                <section className="rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                  <div className="font-black text-slate-900">{selected.items[0]?.name}</div>
                  <div className="mt-1">تعداد: {selected.items[0]?.qty.toLocaleString("fa-IR")} {selected.items[0]?.unit}</div>
                  <div>برند: {selected.brand || "بدون ترجیح"} · مدل: {selected.model || "نامشخص"}</div>
                  <div>محل تحویل: {selected.deliveryLocation || "-"}</div>
                  {selected.items[0]?.specs && <div className="mt-2 border-t border-slate-200 pt-2">{selected.items[0].specs}</div>}
                  {selected.description && <div className="mt-1">{selected.description}</div>}
                </section>

                {selected.status === "pending_admin" && (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="font-black text-amber-950">مرحله ۱: بررسی ادمین فروش</h3>
                    <p className="mt-1 text-xs leading-6 text-amber-800">پس از کنترل مشخصات، درخواست در کارتابل همه تأمین‌کنندگان واجد شرایط قرار می‌گیرد.</p>
                    <button onClick={() => forwardRFQToSuppliers(selected.id)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-black text-white hover:bg-amber-700"><Send className="h-4 w-4" /> ارسال به کارتابل تأمین‌کنندگان</button>
                  </section>
                )}

                {selected.status === "open" && (
                  <section>
                    <div className="mb-3 flex items-center justify-between"><h3 className="font-black text-slate-900">پیشنهادهای تأمین‌کنندگان</h3><span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-black text-purple-700">{selected.bids.length.toLocaleString("fa-IR")} پاسخ</span></div>
                    {selected.bids.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">درخواست ارسال شده و منتظر استعلام تأمین‌کنندگان است.</div>
                    ) : (
                      <div className="space-y-3">
                        {selected.bids.map((bid) => (
                          <div key={bid.id} className="rounded-2xl border border-slate-200 p-3">
                            <div className="flex items-start justify-between gap-2"><div><div className="text-xs font-black text-slate-800">{bid.sellerName}</div><p className="mt-1 text-[10px] leading-5 text-slate-500">{bid.description || "بدون توضیح تکمیلی"}</p></div><div className="min-w-max text-sm font-black text-emerald-700">{formatPriceToman(bid.price)}</div></div>
                            <label className="mt-3 block text-[10px] font-bold text-slate-600">قیمت نهایی برای خریدار (ریال)</label>
                            <input type="number" min={bid.price} value={finalPrices[bid.id] ?? bid.price} onChange={(event) => setFinalPrices((current) => ({ ...current, [bid.id]: Number(event.target.value) }))} className="input-shell mt-1" />
                            <button onClick={() => approveBid(selected, bid.id, bid.price)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-3 py-2.5 text-xs font-black text-white hover:bg-cyan-800"><CheckCircle2 className="h-4 w-4" /> تأیید و انتشار برای این خریدار</button>
                          </div>
                        ))}
                        <label className="block text-[10px] font-bold text-slate-600">پیام ادمین برای خریدار<textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} className="input-shell mt-1 min-h-20" placeholder="شرایط اعتبار پیشنهاد یا توضیح تکمیلی..." /></label>
                      </div>
                    )}
                  </section>
                )}

                {["offer_ready", "buyer_approved", "published"].includes(selected.status) && (
                  <section className={`rounded-2xl border p-4 ${selected.status === "buyer_approved" ? "border-emerald-200 bg-emerald-50" : "border-cyan-200 bg-cyan-50"}`}>
                    <h3 className="font-black text-slate-900">{selected.status === "buyer_approved" ? "خریدار پیشنهاد را تأیید کرد" : "پیشنهاد منتخب برای خریدار منتشر شد"}</h3>
                    <div className="mt-2 text-lg font-black text-emerald-700">{formatPriceToman(selected.finalPrice || selected.bids.find((bid) => bid.id === selected.selectedBidId)?.price || 0)}</div>
                    {selected.adminNote && <p className="mt-2 text-xs leading-6 text-slate-600">{selected.adminNote}</p>}
                    {selected.orderId && <div dir="ltr" className="mt-3 rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-emerald-700">Order: {selected.orderId}</div>}
                  </section>
                )}
              </div>
            </motion.div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof FileSearch; label: string; value: number; tone: "amber" | "purple" | "cyan" | "emerald" }) {
  const styles = { amber: "bg-amber-50 text-amber-700", purple: "bg-purple-50 text-purple-700", cyan: "bg-cyan-50 text-cyan-700", emerald: "bg-emerald-50 text-emerald-700" }[tone];
  return <div className="rounded-2xl border border-slate-100 bg-white p-4"><div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${styles}`}><Icon className="h-5 w-5" /></div><div className="text-2xl font-black text-slate-950">{value.toLocaleString("fa-IR")}</div><div className="text-xs text-slate-500">{label}</div></div>;
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileSearch }) {
  return <div className="rounded-xl border border-slate-100 p-3"><div className="mb-1 flex items-center gap-1 text-[10px] text-slate-400"><Icon className="h-3 w-3" />{label}</div><div className="font-bold text-slate-800">{value}</div></div>;
}

const AnchorIcon = Store;
