import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { categories, productGroups } from "../data/products";
import { useApp } from "../contexts/AppContext";
import { Zap, Anchor, Compass, Shield, Fuel, Zap as Zap2 } from "lucide-react";

const iconMap: Record<string, any> = {
  Engine: Zap,
  Zap: Zap2,
  Anchor,
  Compass,
  Shield,
  Fuel,
};

export function Categories() {
  const { products } = useApp();
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-5xl font-black mb-3">دسته‌بندی محصولات</h1>
            <p className="text-slate-300 max-w-2xl leading-7">
              تمامی قطعات و تجهیزات دریایی در ۱۰ دسته اصلی، ۱۵ گروه محصول و زیر دسته‌های تخصصی سند
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-8">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Zap;
            const catProducts = products.filter((p) => p.categoryId === cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="grid md:grid-cols-[380px_1fr]">
                  {/* Image */}
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      data-category-id={cat.id}
                      onError={(event) => {
                        event.currentTarget.src = "/media/cat-other.webp";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/40" />
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 right-6 left-6 md:left-auto md:max-w-xs">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{cat.name}</h2>
                      <p className="text-sm text-slate-200">
                        {catProducts.length.toLocaleString("fa-IR")} کالا • {productGroups.length.toLocaleString("fa-IR")} گروه محصول
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {productGroups.map((group) => {
                        const count = catProducts.filter((product) => product.productGroupId === group.id).length;
                        return (
                          <Link
                            key={group.id}
                            to={`/products?category=${cat.id}&group=${group.id}`}
                            className="group p-4 rounded-2xl bg-slate-50 hover:bg-gradient-to-bl hover:from-cyan-50 hover:to-blue-50 border border-slate-100 hover:border-cyan-200 transition-all"
                          >
                            <div className="font-bold text-slate-800 group-hover:text-cyan-700 mb-1">
                              {group.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {count.toLocaleString("fa-IR")} کالا
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Featured items */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-600 mb-3">پرفروش‌ترین‌ها</h3>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {catProducts.slice(0, 4).map((p) => (
                          <Link
                            key={p.id}
                            to={`/product/${p.id}`}
                            className="flex-shrink-0 w-36"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                onError={(event) => {
                                  event.currentTarget.src = "/media/product-pump.webp";
                                }}
                              />
                            </div>
                            <div className="text-xs font-semibold text-slate-700 line-clamp-2 leading-5">
                              {p.name}
                            </div>
                            <div className="text-xs font-bold text-cyan-700 mt-1">
                              {p.hasPrice ? `${Math.round(p.price / 10000000).toLocaleString("fa-IR")} م.ت` : "استعلامی"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/products?category=${cat.id}`}
                      className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                    >
                      مشاهده همه محصولات این دسته
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
