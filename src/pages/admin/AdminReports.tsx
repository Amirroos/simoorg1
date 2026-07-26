import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Package,
  Store,
  Users,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Award,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { formatPriceToman, getProductImageSource, productGroups } from "../../data/products";

export function AdminReports() {
  const { products, users, orders } = useApp();

  const sellers = users.filter((u) => u.role === "seller");
  const buyers = users.filter((u) => u.role === "buyer");
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const totalItems = orders.reduce((s, o) => s + o.items.reduce((x, i) => x + i.qty, 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // محصولات پرفروش
  const productSales: Record<string, { product: any; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((i) => {
      const key = i.product.id;
      if (!productSales[key]) {
        productSales[key] = { product: i.product, qty: 0, revenue: 0 };
      }
      productSales[key].qty += i.qty;
      productSales[key].revenue += i.product.price * i.qty;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // فروشندگان برتر
  const sellerSales: Record<string, { name: string; orders: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((i) => {
      const key = i.product.sellerName;
      if (!sellerSales[key]) sellerSales[key] = { name: key, orders: 0, revenue: 0 };
      sellerSales[key].revenue += i.product.price * i.qty;
      sellerSales[key].orders += 1;
    });
  });
  const topSellers = Object.values(sellerSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // توزیع بر اساس گروه محصول
  const productGroupStats = productGroups.map((group) => {
    const cnt = products.filter((p) => p.productGroupId === group.id).length;
    return { name: group.name, count: cnt };
  }).sort((a, b) => b.count - a.count);

  const maxGroupCount = Math.max(...productGroupStats.map((group) => group.count), 1);

  // KPI ها
  const kpis = [
    { code: "KPI-01", label: "نرخ تکمیل پروفایل فروشنده", value: "100%", color: "emerald" },
    { code: "KPI-04", label: "نرخ پاسخ RFQ", value: "85%", color: "cyan" },
    { code: "KPI-07", label: "نرخ تکمیل سفارش", value: orders.length > 0 ? `${Math.round(completedOrders / orders.length * 100)}%` : "0%", color: "amber" },
    { code: "KPI-08", label: "نرخ شکایت", value: "0%", color: "blue" },
    { code: "KPI-09", label: "میانگین امتیاز فروشنده", value: (sellers.reduce((s, u) => s + (u.rating || 5), 0) / sellers.length || 0).toFixed(1), color: "purple" },
    { code: "KPI-10", label: "حجم معاملات", value: formatPriceToman(totalRevenue), color: "rose" },
    { code: "KPI-11", label: "کالاهای ناموجود", value: products.filter((p) => p.stock === 0).length.toLocaleString("fa-IR"), color: "rose" },
    { code: "KPI-14", label: "فروشندگان فعال", value: sellers.filter((s) => s.status === "active").length.toLocaleString("fa-IR"), color: "emerald" },
  ];

  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-cyan-600" />
          گزارش‌ها و تحلیل‌ها
        </h1>
        <p className="text-sm text-slate-500">داده‌های کلیدی عملکرد بازارگاه</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "درآمد کل", value: formatPriceToman(totalRevenue), color: "from-emerald-500 to-teal-600" },
          { icon: ShoppingCart, label: "تعداد سفارش‌ها", value: orders.length.toLocaleString("fa-IR"), color: "from-cyan-500 to-blue-600" },
          { icon: Package, label: "کالاهای فروخته شده", value: totalItems.toLocaleString("fa-IR"), color: "from-purple-500 to-pink-600" },
          { icon: TrendingUp, label: "میانگین ارزش سفارش", value: avgOrderValue > 0 ? formatPriceToman(avgOrderValue) : "—", color: "from-amber-500 to-orange-600" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-slate-100"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-600" />
          شاخص‌های کلیدی عملکرد (KPI)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.code} className={`p-4 rounded-xl border ${colorClasses[k.color]}`}>
              <div className="text-[10px] opacity-70 font-mono mb-1">{k.code}</div>
              <div className="text-lg font-black">{k.value}</div>
              <div className="text-xs opacity-80 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Products & Sellers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-100"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600" />
            پرفروش‌ترین محصولات
          </h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">هنوز فروشی ثبت نشده</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.product.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-200 text-slate-700" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>{(i + 1).toLocaleString("fa-IR")}</div>
                  <img src={getProductImageSource(p.product)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{p.product.name}</div>
                    <div className="text-[10px] text-slate-500">{p.qty.toLocaleString("fa-IR")} عدد فروخته شد</div>
                  </div>
                  <div className="text-xs font-black text-cyan-700 whitespace-nowrap">
                    {formatPriceToman(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-100"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            فروشندگان برتر
          </h3>
          {topSellers.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">هنوز فروشی ثبت نشده</div>
          ) : (
            <div className="space-y-3">
              {topSellers.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-200 text-slate-700" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>{(i + 1).toLocaleString("fa-IR")}</div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.orders.toLocaleString("fa-IR")} فروش</div>
                  </div>
                  <div className="text-xs font-black text-cyan-700 whitespace-nowrap">
                    {formatPriceToman(s.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Product Group Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-slate-100"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          توزیع محصولات بر اساس گروه محصول
        </h3>
        <div className="space-y-3">
          {productGroupStats.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-semibold text-slate-700">{c.name}</span>
                <span className="font-bold text-slate-900">{c.count.toLocaleString("fa-IR")}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.count / maxGroupCount) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-l from-cyan-500 to-blue-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* User Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "خریداران", value: buyers.length, sub: "کاربر فعال", color: "from-cyan-500 to-blue-600" },
          { icon: Store, label: "تأمین‌کنندگان", value: sellers.length, sub: "فروشنده تأیید شده", color: "from-purple-500 to-pink-600" },
          { icon: AlertTriangle, label: "هشدارهای موجودی", value: products.filter(p => p.stock < 5).length, sub: "محصول نیازمند توجه", color: "from-amber-500 to-orange-600" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{s.value.toLocaleString("fa-IR")}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
