import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { ProductCard } from "../components/ProductCard";

export function Favorites() {
  const { user, favorites, products } = useApp();
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">علاقه‌مندی‌ها</h2>
          <p className="text-slate-600 mb-6">
            برای مشاهده لیست علاقه‌مندی، ابتدا وارد حساب کاربری خود شوید
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

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">لیست علاقه‌مندی شما خالی است</h2>
          <p className="text-slate-600 mb-6">
            با کلیک روی قلب کنار محصولات، آن‌ها را به لیست علاقه‌مندی اضافه کنید
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
      <div className="bg-gradient-to-bl from-rose-500 via-rose-600 to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-sm opacity-90">علاقه‌مندی‌های من</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black">
              {favoriteProducts.length.toLocaleString("fa-IR")} کالا
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {favoriteProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
