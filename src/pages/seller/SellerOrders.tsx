import { motion } from "framer-motion";
import { ShoppingCart, Clock, Truck, CheckCircle2, Package } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useSellerProducts } from "./SellerLayout";
import { formatPriceToman } from "../../data/products";
import { formatPersianDate } from "../../utils/persianDate";

export function SellerOrders() {
  const { orders, updateOrderStatus } = useApp();
  const myProducts = useSellerProducts();
  const myProductIds = myProducts.map((p) => p.id);

  // سفارش‌هایی که حداقل یک قلم از محصولات این فروشنده دارند
  const myOrders = orders
    .map((o) => ({
      ...o,
      myItems: o.items.filter((i) => myProductIds.includes(i.product.id)),
    }))
    .filter((o) => o.myItems.length > 0);

  const statusMap: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    paid: { label: "در انتظار آماده‌سازی", icon: Clock, color: "text-amber-700", bg: "bg-amber-100" },
    shipped: { label: "ارسال شده", icon: Truck, color: "text-blue-700", bg: "bg-blue-100" },
    delivered: { label: "تحویل شده", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100" },
    pending: { label: "در انتظار پرداخت", icon: Clock, color: "text-slate-700", bg: "bg-slate-100" },
    cancelled: { label: "لغو شده", icon: Package, color: "text-rose-700", bg: "bg-rose-100" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">سفارش‌های فروشگاه</h1>
        <p className="text-sm text-slate-500">
          {myOrders.length.toLocaleString("fa-IR")} سفارش شامل محصولات شما
        </p>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold mb-1">سفارشی نیست</h3>
          <p className="text-sm text-slate-500">هنوز سفارشی برای محصولات شما ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o, i) => {
            const status = statusMap[o.status];
            const StatusIcon = status?.icon || Clock;
            const subtotal = o.myItems.reduce((s, it) => s + it.product.price * it.qty, 0);
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-4 border border-slate-100"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${status?.bg} ${status?.color} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span dir="ltr" className="font-bold text-slate-800">{o.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status?.bg} ${status?.color}`}>
                          {status?.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {o.userName} • {o.userMobile} • {formatPersianDate(o.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500">سهم شما</div>
                    <div className="font-black text-cyan-700">{formatPriceToman(subtotal)}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {o.myItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      <img src={item.product.image} alt="" className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.qty.toLocaleString("fa-IR")} × {formatPriceToman(item.product.price)}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-800 whitespace-nowrap">
                        {formatPriceToman(item.product.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-600 mb-3 p-3 rounded-lg bg-slate-50">
                  <strong>آدرس تحویل:</strong> {o.address}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  >
                    <option value="paid">در انتظار آماده‌سازی</option>
                    <option value="shipped">ارسال کردم</option>
                    <option value="delivered">تحویل شده</option>
                    <option value="cancelled">لغو شد</option>
                  </select>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
