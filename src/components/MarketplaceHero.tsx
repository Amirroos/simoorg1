import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgePercent,
  Flame,
  PackageSearch,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { formatPriceToman, getProductImageSource, productGroups, type Product } from "../data/products";

type ShowcaseKey = "best-selling" | "popular" | "best-price" | "new";

const showcaseTabs: Array<{
  key: ShowcaseKey;
  label: string;
  hint: string;
  icon: typeof Flame;
}> = [
  { key: "best-selling", label: "پرفروش‌ها", hint: "انتخاب پرتکرار خریداران", icon: Flame },
  { key: "popular", label: "محبوب‌ترین", hint: "بالاترین امتیاز کاربران", icon: Star },
  { key: "best-price", label: "خوش‌قیمت", hint: "قیمت مناسب و موجود", icon: BadgePercent },
  { key: "new", label: "تازه‌رسیده", hint: "جدیدترین کالاهای تأییدشده", icon: Sparkles },
];

function sortShowcase(products: Product[], key: ShowcaseKey) {
  const available = products.filter((product) => product.stock > 0);
  switch (key) {
    case "popular":
      return [...available].sort((a, b) => b.rating * Math.max(b.reviewCount, 1) - a.rating * Math.max(a.reviewCount, 1));
    case "best-price":
      return [...available].filter((product) => product.hasPrice).sort((a, b) => a.price - b.price);
    case "new":
      return [...available].sort((a, b) => (b.createdAt || b.submittedAt || "").localeCompare(a.createdAt || a.submittedAt || ""));
    case "best-selling":
    default:
      return [...available].sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  }
}

export function MarketplaceHero({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<ShowcaseKey>("best-selling");
  const activeMeta = showcaseTabs.find((tab) => tab.key === activeTab) || showcaseTabs[0];
  const selectedProducts = useMemo(() => sortShowcase(products, activeTab).slice(0, 6), [products, activeTab]);
  const leadProduct = selectedProducts[0] || products[0];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-100" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_78%_8%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_12%_16%,rgba(245,158,11,0.16),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_58%,#020617_100%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-8">
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.7fr)]">
          <div className="relative min-h-[300px] min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 px-6 py-8 shadow-2xl shadow-slate-950/20 md:px-10 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_70%,rgba(6,182,212,.22),transparent_33%),linear-gradient(105deg,rgba(2,6,23,.05),rgba(2,6,23,.76))]" />
            {leadProduct && (
              <div className="absolute left-0 top-0 h-full w-[46%] opacity-45 md:opacity-65">
                <img src={getProductImageSource(leadProduct)} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/25 to-slate-950" />
              </div>
            )}
            <div className="relative z-10 min-w-0 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                <TrendingUp className="h-4 w-4" />
                ویترین امروز بازار دریایی
              </div>
              <h1 className="mt-5 text-3xl font-black leading-[1.45] text-white md:text-5xl">
                قطعه مناسب را سریع‌تر
                <span className="block text-amber-300">پیدا و مقایسه کنید</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                برگزیده‌ای از کالاهای پرفروش، محبوب و خوش‌قیمت بازارگاه؛ تأییدشده و آماده بررسی برای ناوگان شما.
              </p>
              <form action="/products" className="mt-6 flex w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-white shadow-xl">
                <Search className="mr-4 mt-3.5 h-5 w-5 shrink-0 text-cyan-700" />
                <input
                  name="q"
                  aria-label="جستجوی کالا"
                  placeholder="نام قطعه، برند یا مدل..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none"
                />
                <button className="m-1.5 rounded-xl bg-cyan-700 px-5 text-sm font-black text-white transition hover:bg-cyan-800">
                  جستجو
                </button>
              </form>
              <div className="mt-5 flex flex-wrap gap-2">
                {productGroups.slice(0, 4).map((group) => (
                  <Link
                    key={group.id}
                    to={`/products?group=${group.id}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-1">
            <Link to="/products?sort=new" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 p-5 text-white shadow-xl">
              <BadgePercent className="absolute -left-4 -bottom-4 h-28 w-28 rotate-12 opacity-15" />
              <div className="relative">
                <span className="text-xs font-bold text-amber-950/70">پیشنهاد اقتصادی</span>
                <h2 className="mt-2 text-xl font-black">خوش‌قیمت‌های امروز</h2>
                <p className="mt-1 text-xs leading-6 text-amber-950/75">کالاهای موجود با بهترین بازه قیمت</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-black">مشاهده کالاها <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span>
              </div>
            </Link>
            <Link to="/product-request" className="group relative overflow-hidden rounded-3xl border border-cyan-200 bg-white p-5 shadow-xl">
              <PackageSearch className="absolute -left-3 -bottom-3 h-24 w-24 -rotate-12 text-cyan-100" />
              <div className="relative">
                <span className="text-xs font-bold text-cyan-700">کالا را پیدا نکردید؟</span>
                <h2 className="mt-2 text-xl font-black text-slate-950">درخواست تأمین ثبت کنید</h2>
                <p className="mt-1 text-xs leading-6 text-slate-500">نیاز شما برای بررسی به تیم فروش می‌رسد</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-700">شروع درخواست <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative -mt-1 min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-xl md:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {showcaseTabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex min-w-max items-center gap-2 rounded-2xl px-4 py-2.5 text-right transition ${active ? "bg-slate-950 text-white shadow-lg" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-amber-300" : "text-cyan-700"}`} />
                  <span>
                    <span className="block text-xs font-black">{tab.label}</span>
                    <span className={`hidden text-[10px] sm:block ${active ? "text-slate-300" : "text-slate-400"}`}>{tab.hint}</span>
                  </span>
                </button>
              );
            })}
            <Link to="/products" className="mr-auto flex min-w-max items-center gap-1 px-3 text-xs font-black text-cyan-700">
              همه محصولات <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {selectedProducts.map((product, index) => (
              <motion.div key={`${activeTab}-${product.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Link to={`/product/${product.id}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={getProductImageSource(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {index === 0 && <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-1 text-[9px] font-black text-amber-950">انتخاب ویژه</span>}
                  </div>
                  <div className="p-3">
                    <div className="truncate text-[10px] font-bold text-cyan-700">{product.brand} · {product.model}</div>
                    <h3 className="mt-1 line-clamp-2 min-h-10 text-xs font-black leading-5 text-slate-800">{product.name}</h3>
                    <div className="mt-2 text-xs font-black text-slate-950">{product.hasPrice ? formatPriceToman(product.price) : "قیمت استعلامی"}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {selectedProducts.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">در بخش {activeMeta.label} هنوز کالایی ثبت نشده است.</div>
          )}
        </div>
      </div>
    </section>
  );
}
