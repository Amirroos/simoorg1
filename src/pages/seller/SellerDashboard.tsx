import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, Star, AlertTriangle, Plus, ArrowLeft, TrendingUp } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useSellerProducts } from "./SellerLayout";
import { formatPriceToman } from "../../data/products";
import { formatPersianDate } from "../../utils/persianDate";

export function SellerDashboard() {
  const { user, orders } = useApp();
  const myProducts = useSellerProducts();

  // سفارش‌هایی که شامل محصول این فروشنده هستند
  const myOrders = orders.filter((o) =>
    o.items.some((i) => myProducts.some((p) => p.id === i.product.id))
  );

  const totalRevenue = myOrders.reduce((sum, o) => {
    return (
      sum +
      o.items
        .filter((i) => myProducts.some((p) => p.id === i.product.id))
        .reduce((s, i) => s + i.product.price * i.qty, 0)
    );
  }, 0);

  const lowStockCount = myProducts.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = myProducts.filter((p) => p.stock === 0).length;

  const stats = [
    { icon: Package, label: "محصولات من", value: myProducts.length, color: "from-purple-500 to-pink-600", link: "/seller/products" },
    { icon: ShoppingCart, label: "سفارش‌ها", value: myOrders.length, color: "from-cyan-500 to-blue-600", link: "/seller/orders" },
    { icon: DollarSign, label: "درآمد کل", value: formatPriceToman(totalRevenue), color: "from-emerald-500 to-teal-600", link: "/seller/orders" },
    { icon: Star, label: "امتیاز فروشگاه", value: (user?.rating || 5).toLocaleString("fa-IR"), color: "from-amber-500 to-orange-600", link: "/seller/profile" },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-bl from-purple-900 via-pink-800 to-rose-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs text-purple-200 mb-1">سلام،</div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">{user?.companyName}</h1>
          <p className="text-purple-200 text-sm">پنل مدیریت فروشگاه شما در سیمرغ تأمین دریا</p>
          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-sm hover:scale-105 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            افزودن محصول جدید
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={s.link} className="block bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-black text-slate-900 truncate">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-amber-800 mb-1">توجه به موجودی</div>
              <div className="text-sm text-amber-700">
                {outOfStockCount > 0 && (
                  <span>
                    <strong>{outOfStockCount.toLocaleString("fa-IR")}</strong> محصول اتمام موجودی •{" "}
                  </span>
                )}
                {lowStockCount > 0 && (
                  <span>
                    <strong>{lowStockCount.toLocaleString("fa-IR")}</strong> محصول با موجودی کم
                  </span>
                )}
              </div>
              <Link
                to="/seller/products"
                className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline font-semibold mt-2"
              >
                مدیریت موجودی
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            آخرین سفارش‌های فروشگاه شما
          </h3>
          <Link to="/seller/orders" className="text-sm text-purple-700 hover:underline font-semibold flex items-center gap-1">
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        {myOrders.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            هنوز سفارشی برای محصولات شما ثبت نشده است
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span dir="ltr" className="font-bold text-sm text-slate-800">{o.id}</span>
                    <span className="text-xs text-slate-500">• {o.userName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatPersianDate(o.createdAt)}
                  </div>
                </div>
                <div className="font-black text-cyan-700 text-sm">
                  {formatPriceToman(o.items.filter(i => myProducts.some(p => p.id === i.product.id)).reduce((s, i) => s + i.product.price * i.qty, 0))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
