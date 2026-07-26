import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { productGroups, detailedSubcategoryGroups, getProductImageSource } from "../data/products";
import { useApp } from "../contexts/AppContext";
import {
  Zap,
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
} from "lucide-react";

const iconMap: Record<string, any> = {
  Zap,
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

export function Categories() {
  const { products } = useApp();
  const publishedProducts = products.filter((product) => product.status === "published");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-black mb-3">گروه محصول</h1>
            <p className="text-slate-300 max-w-2xl leading-7">
              تامین تجهیزات و قطعات دریایی در ۱۵ گروه محصول تخصصی برای شناورها، موتورخانه، عرشه، ناوبری، ایمنی و سامانه‌های پشتیبان.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {productGroups.map((group, i) => {
            const Icon = iconMap[group.icon] || Package;
            const groupProducts = publishedProducts.filter((product) => product.productGroupId === group.id);
            const subcategories = detailedSubcategoryGroups
              .filter((item) => item.productGroupIds.includes(group.id))
              .flatMap((item) => item.subcategories)
              .slice(0, 6);

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <Link to={`/products?group=${group.id}`} className="block">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      onError={(event) => {
                        event.currentTarget.src = "/media/cat-other.webp";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                    <div className="absolute bottom-5 right-5 left-5">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-black text-white leading-8">{group.name}</h2>
                      <p className="text-sm text-slate-200">
                        {groupProducts.length.toLocaleString("fa-IR")} کالا
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  {subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          to={`/products?group=${group.id}&subcategory=${subcategory.id}`}
                          className="px-3 py-1 rounded-full bg-slate-50 hover:bg-cyan-50 text-xs font-semibold text-slate-700 hover:text-cyan-700 border border-slate-100 hover:border-cyan-100 transition"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4">
                    {groupProducts.slice(0, 4).map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="flex-shrink-0 w-28">
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                          <img
                            src={getProductImageSource(product)}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            onError={(event) => {
                              event.currentTarget.src = "/media/catalog-generated/marine.jpg";
                            }}
                          />
                        </div>
                        <div className="text-xs font-semibold text-slate-700 line-clamp-2 leading-5">
                          {product.name}
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    to={`/products?group=${group.id}`}
                    className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                  >
                    مشاهده محصولات این گروه
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
