import { motion } from "framer-motion";
import { useApp, isRFQPublished } from "../contexts/AppContext";
import { FileSearch, Clock, Package, CheckCircle2 } from "lucide-react";
import { formatPriceToman } from "../data/products";

export function BuyerRFQs() {
  const { user, rfqs } = useApp();
  const myRfqs = user ? rfqs.filter(r => r.buyerId === user.id) : [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <FileSearch className="w-8 h-8 text-cyan-600" />
          درخواست‌های استعلام (RFQ) من
        </h1>

        {myRfqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 shadow-sm">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold mb-2">هنوز درخواستی ثبت نکرده‌اید</h3>
            <p className="text-slate-500">برای استعلام قیمت قطعات تخصصی، فرم RFQ را پر کنید.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRfqs.map((rfq, i) => {
              const published = isRFQPublished(rfq);
              const requestType = rfq.requestType || "missing_product";
              const sortedBids = [...rfq.bids].sort((a, b) => a.price - b.price);
              const lowestBid = rfq.bids.length > 0 
                ? rfq.bids.reduce((min, b) => b.price < min.price ? b : min, rfq.bids[0])
                : null;

              return (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span dir="ltr" className="font-bold text-slate-800">{rfq.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          requestType === "product_price" ? "bg-cyan-100 text-cyan-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {requestType === "product_price" ? "استعلام قیمت کالای موجود" : "تامین کالای خارج از فهرست"}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {published ? "پایان مهلت - نمایش قیمت‌ها" : "در حال دریافت پیشنهاد"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{rfq.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        ثبت: {new Date(rfq.createdAt).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-cyan-600" />
                          اقلام درخواستی
                        </h4>
                        <div className="space-y-2">
                          {rfq.items.map((item) => (
                            <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                              <div className="flex justify-between font-semibold text-sm mb-1">
                                <span>{item.name}</span>
                                <span>{item.qty} {item.unit}</span>
                              </div>
                              <p className="text-xs text-slate-500">{item.specs}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bids */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          پیشنهادات ({rfq.bids.length})
                        </h4>
                        
                        {!published ? (
                          <div className="h-full flex flex-col items-center justify-center p-6 bg-amber-50 border border-amber-100 rounded-xl text-center">
                            <Clock className="w-8 h-8 text-amber-400 mb-2" />
                            <p className="text-sm font-semibold text-amber-800 mb-1">
                              پنهان تا پایان مهلت ۷ روزه
                            </p>
                            <p className="text-xs text-amber-700">
                              پس از اتمام زمان، ارزان‌ترین قیمت را به شما نمایش خواهیم داد. (یا تأیید ادمین)
                            </p>
                          </div>
                        ) : rfq.bids.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-500">
                            پیشنهادی برای این درخواست ثبت نشد.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sortedBids.map(bid => {
                              const isLowest = lowestBid?.id === bid.id;
                              return (
                                <div key={bid.id} className={`p-4 rounded-xl border ${
                                  isLowest ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                                }`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-slate-800">{bid.sellerName}</div>
                                    <div className={`font-black ${isLowest ? "text-emerald-700 text-lg" : "text-slate-600 text-base"}`}>
                                      {formatPriceToman(bid.price)}
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600">{bid.description}</p>
                                  {isLowest && (
                                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      ★ ارزان‌ترین پیشنهاد
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
