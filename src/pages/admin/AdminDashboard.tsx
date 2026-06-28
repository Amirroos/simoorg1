import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  Store,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  Activity,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { formatPriceToman } from "../../data/products";

export function AdminDashboard() {
  const { products, users, orders } = useApp();

  const sellers = users.filter((u) => u.role === "seller");
  const buyers = users.filter((u) => u.role === "buyer");
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "paid");
  const recentOrders = [...orders].slice(0, 5);

  const stats = [
    {
      label: "کل محصولات",
      value: products.length.toLocaleString("fa-IR"),
      icon: Package,
      color: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      link: "/admin/products",
    },
    {
      label: "تأمین‌کنندگان",
      value: sellers.length.toLocaleString("fa-IR"),
      icon: Store,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
      text: "text-purple-700",
      link: "/admin/sellers",
    },
    {
      label: "کاربران خریدار",
      value: buyers.length.toLocaleString("fa-IR"),
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      link: "/admin/users",
    },
    {
      label: "سفارش‌های کل",
      value: orders.length.toLocaleString("fa-IR"),
      icon: ShoppingCart,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
      link: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-black mb-1">خوش آمدید!</h1>
          <p className="text-slate-300 text-sm">
            خلاصه‌ای از وضعیت بازارگاه سیمرغ تأمین دریا در یک نگاه
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>سامانه فعال</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>درآمد کل: {formatPriceToman(totalRevenue)}</span>
            </div>
          </div>
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
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-bold text-rose-800">اتمام موجودی</div>
                    <div className="text-xs text-rose-600">
                      {outOfStock.length.toLocaleString("fa-IR")} محصول
                    </div>
                  </div>
                </div>
                <Link to="/admin/products" className="text-xs text-rose-700 font-semibold hover:underline">
                  مشاهده
                </Link>
              </div>
              <div className="space-y-1">
                {outOfStock.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-xs text-rose-700 truncate">
                    • {p.name}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {lowStockProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-800">موجودی کم</div>
                    <div className="text-xs text-amber-600">
                      {lowStockProducts.length.toLocaleString("fa-IR")} محصول
                    </div>
                  </div>
                </div>
                <Link to="/admin/products" className="text-xs text-amber-700 font-semibold hover:underline">
                  مشاهده
                </Link>
              </div>
              <div className="space-y-1">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-xs text-amber-700 truncate flex justify-between gap-2">
                    <span className="truncate">• {p.name}</span>
                    <span className="font-bold flex-shrink-0">{p.stock.toLocaleString("fa-IR")}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-slate-800">آخرین سفارش‌ها</h3>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {pendingOrders.length.toLocaleString("fa-IR")} منتظر پردازش
              </span>
            )}
          </div>
          <Link to="/admin/orders" className="flex items-center gap-1 text-sm text-cyan-700 hover:text-cyan-800 font-semibold">
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            هنوز سفارشی ثبت نشده است
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span dir="ltr" className="font-bold text-sm text-slate-800">{o.id}</span>
                    <span className="text-xs text-slate-500">• {o.userName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {o.items.length.toLocaleString("fa-IR")} کالا •{" "}
                    {new Date(o.createdAt).toLocaleDateString("fa-IR")}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-black text-cyan-700 text-sm">
                    {formatPriceToman(o.total)}
                  </div>
                  <div className={`inline-flex items-center gap-1 text-[10px] mt-0.5 ${
                    o.status === "paid" ? "text-amber-600" :
                    o.status === "delivered" ? "text-emerald-600" :
                    o.status === "shipped" ? "text-blue-600" : "text-slate-500"
                  }`}>
                    {o.status === "paid" && <><Clock className="w-3 h-3" /> در انتظار پردازش</>}
                    {o.status === "delivered" && <><CheckCircle2 className="w-3 h-3" /> تحویل شد</>}
                    {o.status === "shipped" && <>ارسال شده</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <Link
          to="/admin/sellers"
          className="group p-5 rounded-2xl bg-gradient-to-bl from-purple-500 to-pink-600 text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Store className="w-8 h-8 mb-3" />
          <div className="font-bold text-lg mb-1">افزودن تأمین‌کننده</div>
          <div className="text-sm opacity-90">یک حساب فروشنده جدید بسازید</div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            افزودن جدید
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition" />
          </div>
        </Link>
        <Link
          to="/admin/products"
          className="group p-5 rounded-2xl bg-gradient-to-bl from-cyan-500 to-blue-700 text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Package className="w-8 h-8 mb-3" />
          <div className="font-bold text-lg mb-1">مدیریت محصولات</div>
          <div className="text-sm opacity-90">بررسی، انتشار یا حذف محصولات</div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            مشاهده لیست
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition" />
          </div>
        </Link>
        <Link
          to="/admin/reports"
          className="group p-5 rounded-2xl bg-gradient-to-bl from-emerald-500 to-teal-600 text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <TrendingUp className="w-8 h-8 mb-3" />
          <div className="font-bold text-lg mb-1">گزارش‌های تحلیلی</div>
          <div className="text-sm opacity-90">تحلیل فروش، KPI و عملکرد</div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            مشاهده گزارش
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
