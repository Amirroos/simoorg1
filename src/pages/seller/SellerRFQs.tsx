import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../../contexts/AppContext";
import { FileSearch, DollarSign, CheckCircle2, Clock, Send } from "lucide-react";

export function SellerRFQs() {
  const { user, rfqs, products, addRFQBid } = useApp();
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidDesc, setBidDesc] = useState("");

  if (!user) return null;

  const sellerMatchesProductRFQ = (rfq: (typeof rfqs)[number]) => {
    if ((rfq.requestType || "missing_product") !== "product_price") return true;
    const product = rfq.productId ? products.find((p) => p.id === rfq.productId) : null;
    const sellerNames = [user.companyName, user.name].filter(Boolean);
    return (
      rfq.productSellerId === user.id ||
      sellerNames.includes(rfq.productSellerName || "") ||
      product?.sellerId === user.id ||
      sellerNames.includes(product?.sellerName || "")
    );
  };

  // کالای خارج از فهرست برای همه تامین‌کنندگان است؛ استعلام قیمت کالای موجود فقط برای تامین‌کننده همان کالا.
  const availableRfqs = rfqs.filter(r => r.status !== "closed" && sellerMatchesProductRFQ(r));

  const handleBid = (e: React.FormEvent, rfqId: string) => {
    e.preventDefault();
    if (!bidPrice) return;
    addRFQBid(rfqId, {
      price: parseInt(bidPrice),
      description: bidDesc
    });
    setSelectedRFQ(null);
    setBidPrice("");
    setBidDesc("");
    alert("پیشنهاد شما ثبت شد.");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">درخواست‌های استعلام (RFQ)</h1>
        <p className="text-sm text-slate-500">مشاهده نیازهای خریداران و ثبت پیشنهاد قیمت</p>
      </div>

      {availableRfqs.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 shadow-sm">
          <FileSearch className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold">درخواستی وجود ندارد</h3>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          <div className="space-y-4">
            {availableRfqs.map((rfq) => {
              const myBid = rfq.bids.find(b => b.sellerId === user.id);
              
              return (
                <motion.div
                  key={rfq.id}
                  className={`bg-white rounded-2xl p-5 border transition ${
                    selectedRFQ === rfq.id ? "border-purple-500 shadow-md ring-1 ring-purple-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="font-bold text-slate-900 mb-1">{rfq.title}</div>
                      <div className="text-xs text-slate-500 flex gap-2">
                        <span dir="ltr">{rfq.id}</span>
                        <span>•</span>
                        <span className="font-bold text-purple-700">
                          {(rfq.requestType || "missing_product") === "product_price" ? "استعلام قیمت کالای من" : "درخواست کالای خارج از فهرست"}
                        </span>
                        <span>•</span>
                        <span>{rfq.vesselType}</span>
                        <span>•</span>
                        <span className={rfq.urgency === "urgent" ? "text-rose-500 font-bold" : ""}>
                          {rfq.urgency === "urgent" ? "فوری" : "عادی"}
                        </span>
                      </div>
                    </div>
                    {myBid ? (
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        پیشنهاد داده‌اید
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedRFQ(rfq.id);
                          setBidPrice("");
                          setBidDesc("");
                        }}
                        className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition"
                      >
                        ثبت پیشنهاد
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mb-3 leading-7">{rfq.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {rfq.items.map(item => (
                      <div key={item.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-slate-500">{item.qty} {item.unit}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    تاریخ نیاز: {rfq.neededBy}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Form Side */}
          <div className="lg:sticky lg:top-20 self-start">
            {selectedRFQ ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-5 border border-purple-200 shadow-xl shadow-purple-500/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  ثبت قیمت شما
                </h3>
                <form onSubmit={(e) => handleBid(e, selectedRFQ)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">مبلغ کل (ریال)</label>
                    <input
                      type="number"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      placeholder="مثلا 150000000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 text-sm"
                      required
                    />
                    {bidPrice && (
                      <div className="text-[10px] text-emerald-600 mt-1">
                        معادل {Math.round(parseInt(bidPrice) / 10).toLocaleString("fa-IR")} تومان
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">توضیحات و شرایط شما</label>
                    <textarea
                      value={bidDesc}
                      onChange={(e) => setBidDesc(e.target.value)}
                      placeholder="زمان آماده‌سازی، نحوه ارسال و..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 text-sm h-24 resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    ارسال پیشنهاد
                  </button>
                  <button type="button" onClick={() => setSelectedRFQ(null)} className="w-full py-2 text-xs text-slate-500 hover:text-slate-700">انصراف</button>
                </form>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 text-slate-400">
                <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">برای ثبت پیشنهاد، روی دکمه «ثبت پیشنهاد» در درخواست مورد نظر کلیک کنید.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
