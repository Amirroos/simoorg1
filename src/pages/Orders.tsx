import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle2, Truck, ShoppingBag, X } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatPriceToman } from "../data/products";

export function Orders() {
  const { user, orders } = useApp();
  const userOrders = user ? orders.filter((o) => o.userId === user.id) : [];

  const statusMap: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: "در انتظار پرداخت", icon: Clock, color: "amber" },
    paid: { label: "پرداخت شده", icon: CheckCircle2, color: "emerald" },
    shipped: { label: "ارسال شده", icon: Truck, color: "blue" },
    delivered: { label: "تحویل شده", icon: Package, color: "cyan" },
    cancelled: { label: "لغو شده", icon: X, color: "rose" },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">دسترسی محدود</h2>
          <p className="text-slate-600 mb-6">
            برای مشاهده سفارش‌ها ابتدا وارد حساب کاربری خود شوید
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent("openAuthModal");
              window.dispatchEvent(event);
            }}
            className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
          >
            ورود / ثبت‌نام
          </button>
        </motion.div>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">هنوز سفارشی ثبت نکرده‌اید</h2>
          <p className="text-slate-600 mb-6">
            محصولات بازارگاه را بررسی کنید و اولین سفارش خود را ثبت کنید
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
          >
            مشاهده محصولات
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">سفارش‌های من</h1>

        <div className="space-y-4">
          {userOrders.map((order, i) => {
            const status = statusMap[order.status];
            const StatusIcon = status.icon;
            const colorClasses: Record<string, string> = {
              amber: "bg-amber-50 text-amber-700 border-amber-100",
              emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
              blue: "bg-blue-50 text-blue-700 border-blue-100",
              cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
            };

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span dir="ltr" className="font-bold text-slate-800">
                        {order.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${colorClasses[status.color]}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.qty.toLocaleString("fa-IR")} عدد ×{" "}
                          {formatPriceToman(item.product.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="text-slate-500">مبلغ کل: </span>
                    <span className="font-black text-cyan-700">{formatPriceToman(order.total)}</span>
                  </div>
                  <Link
                    to={`/product/${order.items[0]?.product.id}`}
                    className="text-sm text-cyan-700 hover:underline font-semibold"
                  >
                    مشاهده جزئیات
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
