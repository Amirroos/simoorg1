import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Shield, Truck, Award, Sparkles, Zap, Anchor, Compass, Zap as Zap2, LifeBuoy, Fuel, TrendingUp, Users, FileSearch, Star, Radar, Radio, Settings, PaintBucket, Package, Wind, Gauge, RefreshCw, Utensils } from "lucide-react";
import { MarketplaceHero } from "../components/MarketplaceHero";
import { ProductCard } from "../components/ProductCard";
import { productGroups } from "../data/products";
import { useApp } from "../contexts/AppContext";

const iconMap: Record<string, any> = {
  Engine: Zap,
  Zap: Zap2,
  Anchor,
  Compass,
  Shield,
  Fuel,
  Radar,
  Radio,
  Settings,
  PaintBucket,
  Package,
  Wind,
  Gauge,
  RefreshCw,
  Utensils,
};

const simorghServiceCards = [
  { id: "simorgh-quality", name: "کنترل و تایید سیمرغ", rating: 5, location: "بررسی پیش از انتشار" },
  { id: "simorgh-pricing", name: "قیمت‌گذاری نهایی سیمرغ", rating: 5, location: "اعمال سود و تایید ادمین" },
  { id: "simorgh-sourcing", name: "تامین متمرکز سیمرغ", rating: 5, location: "بدون نمایش نام تامین‌کننده" },
  { id: "simorgh-support", name: "پشتیبانی خرید سیمرغ", rating: 5, location: "پیگیری سفارش و اصالت کالا" },
  { id: "simorgh-rfq", name: "درخواست تامین سیمرغ", rating: 5, location: "جمع‌آوری پیشنهادهای تامین" },
];

export function Home() {
  const { products } = useApp();
  const publishedProducts = products.filter((p) => p.status === "published");
  // Featured: top rated + with stock
  const featured = [...publishedProducts]
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  // New arrivals
  const newArrivals = publishedProducts.slice(0, 4);

  return (
    <div>
      {/* Product-first marketplace entrance */}
      <MarketplaceHero products={publishedProducts} />

      {/* Trust strip */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "ضمانت اصالت", desc: "تمامی کالاها تأیید شده" },
            { icon: Truck, title: "ارسال سراسری", desc: "از بندرعباس تا انزلی" },
            { icon: Award, title: "فروشندگان برتر", desc: "رتبه‌بندی و اعتبارسنجی" },
            { icon: Sparkles, title: "پشتیبانی ۲۴/۷", desc: "همراه شما در خرید" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-cyan-700" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-700 text-sm font-semibold mb-2">
              <Compass className="w-4 h-4" />
              گروه‌های محصول
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              تجهیزات و قطعات دریایی در یک نگاه
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {productGroups.map((group, i) => {
            const Icon = iconMap[group.icon] || Package;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/products?group=${group.id}`}
                  className="group relative block overflow-hidden rounded-2xl aspect-square"
                >
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-2 group-hover:bg-cyan-500 group-hover:rotate-6 transition-all">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-sm leading-6">{group.name}</h3>
                    <p className="text-slate-200 text-xs mt-0.5">
                      مشاهده محصولات
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Flame className="w-4 h-4" />
              پرفروش‌ترین‌ها
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              قطعات منتخب بازارگاه
            </h2>
            <p className="text-slate-600 mt-2">پرفروش‌ترین‌ها با امتیاز بالا از فروشندگان تأییدشده</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            همه محصولات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* RFQ CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-blue-900 via-cyan-800 to-blue-950 p-8 md:p-14">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-cyan-200 text-xs font-semibold mb-4">
                <FileSearch className="w-4 h-4" />
                دریا یار
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                قطعه نایاب دارید؟
                <br />
                <span className="gradient-text">ما پیدایش می‌کنیم</span>
              </h2>
              <p className="text-lg text-slate-200 leading-8 mb-6">
                نیاز فنی شناور را به زبان ساده بگویید. دریا یار مرحله‌به‌مرحله مشخصات لازم را می‌پرسد
                و از بین محصولات سایت گزینه مناسب را پیشنهاد می‌دهد.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/rfq"
                  className="px-6 py-3.5 rounded-xl bg-white text-blue-900 font-bold shadow-xl hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  گفت‌وگو با دریا یار
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur text-white font-bold hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  چطور کار می‌کند؟
                </a>
              </div>
            </div>

            <div id="how-it-works" className="grid grid-cols-1 gap-3">
              {[
                { n: "۱", title: "ثبت درخواست", desc: "جزئیات قطعه و تعداد را وارد کنید" },
                { n: "۲", title: "تطبیق هوشمند", desc: "سامانه فروشندگان مرتبط را شناسایی می‌کند" },
                { n: "۳", title: "دریافت پیشنهاد", desc: "ظرف ۲۴ ساعت چند پیشنهاد دریافت می‌کنید" },
                { n: "۴", title: "انتخاب و خرید", desc: "بهترین گزینه را انتخاب و خرید کنید" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <div className="text-white font-bold">{step.title}</div>
                    <div className="text-slate-300 text-sm">{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              تازه‌های بازار
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              جدیدترین محصولات ثبت شده
            </h2>
          </div>
          <Link
            to="/products?sort=new"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Top Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-purple-600 text-sm font-semibold mb-2">
              <Award className="w-4 h-4" />
              فروشندگان برتر
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              تأمین‌کنندگان مورد اعتماد
            </h2>
            <p className="text-slate-600 mt-2">فروشندگان تأییدشده با بالاترین امتیاز و سابقه</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {simorghServiceCards.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-5 rounded-2xl bg-white border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all"
            >
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                رتبه {i + 1}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg shadow-cyan-500/30">
                {s.name.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-800 mb-1 group-hover:text-cyan-700 transition">
                {s.name}
              </h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-800">
                  {s.rating.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs text-slate-500 mr-1">• تأیید شده</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <LifeBuoy className="w-3 h-3" />
                {s.location}
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className={`h-1 flex-1 rounded-full ${j < Math.round(s.rating) ? "bg-amber-400" : "bg-slate-100"}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-950 via-slate-900 to-cyan-950" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(6,182,212,0.3), transparent 60%)`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              بازارگاه در یک نگاه
            </h2>
            <p className="text-slate-300">اعداد واقعی از فعالیت روزانه سیمرغ تأمین دریا</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: "۱۲,۸۰۰+", label: "کاربر فعال" },
              { icon: TrendingUp, value: "۸۵,۰۰۰", label: "معامله موفق" },
              { icon: Anchor, value: "۲,۵۰۰+", label: "قطعه ثبت شده" },
              { icon: Award, value: "۹۸٪", label: "رضایت خریداران" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass border border-white/10 text-center hover:bg-white/10 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-slate-300">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
