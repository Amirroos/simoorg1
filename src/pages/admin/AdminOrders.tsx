import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Eye, Package, Truck, CheckCircle2, Clock, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { formatPriceToman } from "../../data/products";
import { formatPersianDate } from "../../utils/persianDate";

export function AdminOrders() {
  const { orders, updateOrderStatus } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.id.toLowerCase().includes(q) &&
        !o.userName?.toLowerCase().includes(q) &&
        !o.userMobile?.includes(q)
      )
        return false;
    }
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    return true;
  });

  const statusMap: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending: { label: "در انتظار پرداخت", icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
    paid: { label: "پرداخت شده", icon: CheckCircle2, color: "text-amber-700", bg: "bg-amber-100" },
    shipped: { label: "ارسال شده", icon: Truck, color: "text-blue-700", bg: "bg-blue-100" },
    delivered: { label: "تحویل شده", icon: Package, color: "text-emerald-700", bg: "bg-emerald-100" },
    cancelled: { label: "لغو شده", icon: X, color: "text-rose-700", bg: "bg-rose-100" },
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">سفارش‌ها</h1>
        <p className="text-sm text-slate-500">
          مجموع {orders.length.toLocaleString("fa-IR")} سفارش • درآمد:{" "}
          <span className="font-bold text-cyan-700">{formatPriceToman(totalRevenue)}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusMap).slice(0, 4).map(([key, s]) => {
          const count = orders.filter((o) => o.status === key).length;
          const Icon = s.icon;
          return (
            <div key={key} className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{count.toLocaleString("fa-IR")}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="شماره سفارش، نام مشتری، موبایل..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="paid">پرداخت شده</option>
            <option value="shipped">ارسال شده</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>سفارشی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((o, i) => {
              const status = statusMap[o.status];
              const StatusIcon = status?.icon || Clock;
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${status?.bg || "bg-slate-100"} ${status?.color || "text-slate-600"} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span dir="ltr" className="font-bold text-slate-800">{o.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status?.bg} ${status?.color}`}>
                            {status?.label}
                          </span>
                        </div>
                        <div className="font-black text-cyan-700 text-sm">
                          {formatPriceToman(o.total)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {o.userName} ({o.userMobile}) • {o.items.length.toLocaleString("fa-IR")} کالا •{" "}
                        {formatPersianDate(o.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(o.id === selectedOrder ? null : o.id)}
                          className="text-xs text-cyan-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Eye className="w-3 h-3" />
                          {o.id === selectedOrder ? "بستن جزئیات" : "مشاهده جزئیات"}
                        </button>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                        >
                          <option value="paid">پرداخت شده</option>
                          <option value="shipped">ارسال شده</option>
                          <option value="delivered">تحویل شده</option>
                          <option value="cancelled">لغو شده</option>
                        </select>
                      </div>

                      {/* Details */}
                      {selectedOrder === o.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-slate-100"
                        >
                          <div className="text-xs text-slate-600 mb-2">
                            <strong>آدرس تحویل:</strong> {o.address}
                          </div>
                          <div className="space-y-2">
                            {o.items.map((item) => (
                              <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                                <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{item.product.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {item.qty.toLocaleString("fa-IR")} × {formatPriceToman(item.product.price)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
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
