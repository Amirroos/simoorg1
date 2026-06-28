import { motion } from "framer-motion";
import { useApp } from "../../contexts/AppContext";
import { formatPriceToman } from "../../data/products";
import { FileSearch, Eye } from "lucide-react";
import { useState } from "react";

export function AdminRFQs() {
  const { rfqs, publishRFQ } = useApp();
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">درخواست‌های استعلام (RFQ)</h1>
        <p className="text-sm text-slate-500">مشاهده و مدیریت استعلام‌های ثبت شده کاربران</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          {rfqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 text-slate-500">
              درخواستی وجود ندارد
            </div>
          ) : (
            rfqs.map(rfq => {
              const requestType = rfq.requestType || "missing_product";
              return (
              <motion.div key={rfq.id} className="bg-white rounded-2xl p-4 border border-slate-200">
                <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{rfq.title}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span dir="ltr">{rfq.id}</span>
                      <span>• خریدار: {rfq.buyerName}</span>
                      <span>•</span>
                      <span className="font-bold text-cyan-700">
                        {requestType === "product_price" ? "استعلام قیمت کالای موجود" : "کالای خارج از فهرست"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      rfq.status === "open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {rfq.status === "open" ? "در انتظار پیشنهادات" : "منتشر شده (بسته)"}
                    </span>
                    <button
                      onClick={() => setSelectedRFQ(rfq.id === selectedRFQ ? null : rfq.id)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-700 flex justify-between">
                  <span>تعداد اقلام: {rfq.items.length}</span>
                  <span>تعداد پیشنهادات: {rfq.bids.length}</span>
                </div>
              </motion.div>
              );
            })
          )}
        </div>

        {/* Details Side */}
        <div className="lg:sticky lg:top-20 self-start">
          {selectedRFQ ? (() => {
            const rfq = rfqs.find(r => r.id === selectedRFQ);
            if (!rfq) return null;
            const requestType = rfq.requestType || "missing_product";
            const sortedBids = [...rfq.bids].sort((a, b) => a.price - b.price);
            const lowestBid = sortedBids[0] || null;
            return (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-5 border border-cyan-200 shadow-xl">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-cyan-600" />
                  جزئیات درخواست
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100">
                    <div className="text-xs text-cyan-700 font-bold mb-1">نوع درخواست</div>
                    <div className="font-semibold text-slate-800">
                      {requestType === "product_price" ? "استعلام قیمت کالای موجود در سامانه" : "درخواست تامین کالای خارج از فهرست"}
                    </div>
                    {requestType === "product_price" && (
                      <div className="text-xs text-slate-600 mt-1">
                        تامین‌کننده محصول: {rfq.productSellerName || "نامشخص"}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">اقلام درخواستی:</div>
                    {rfq.items.map(i => (
                      <div key={i.id} className="flex justify-between font-semibold">
                        <span>{i.name}</span>
                        <span>{i.qty} {i.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>پیشنهادات ({rfq.bids.length})</span>
                      {rfq.status === "open" && rfq.bids.length > 0 && (
                        <button
                          onClick={() => {
                            if (confirm("آیا می‌خواهید قیمت‌ها قبل از ۷ روز به خریدار نمایش داده شوند؟")) {
                              publishRFQ(rfq.id);
                            }
                          }}
                          className="px-2 py-1 bg-cyan-600 text-white text-[10px] rounded-lg shadow"
                        >
                          انتشار زودتر از موعد
                        </button>
                      )}
                    </div>
                    {rfq.bids.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-slate-100">پیشنهادی ثبت نشده است</div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {sortedBids.map(b => {
                          const isLowest = lowestBid?.id === b.id;
                          return (
                          <div key={b.id} className={`p-2 border rounded-lg ${isLowest ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold text-slate-700">{b.sellerName}</span>
                              <span className="font-black text-emerald-700">{formatPriceToman(b.price)}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-4">{b.description}</div>
                            {isLowest && (
                              <div className="mt-1 text-[10px] font-bold text-emerald-700">پایین‌ترین پیشنهاد</div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })() : (
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 text-slate-400">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">برای مشاهده جزئیات و پیشنهادات، روی دکمه مشاهده کلیک کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
