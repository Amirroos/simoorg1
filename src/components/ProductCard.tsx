import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, MapPin, CheckCircle2, Truck } from "lucide-react";
import type { Product } from "../data/products";
import { formatPriceToman, productGroups } from "../data/products";
import { useApp } from "../contexts/AppContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, favorites, toggleFavorite, user } = useApp();
  const isFavorite = favorites.includes(product.id);
  const productGroup = productGroups.find((item) => item.id === product.productGroupId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      className="product-card group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100"
    >
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="block relative overflow-hidden aspect-[4/3] bg-slate-100"
        data-product-id={product.id}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-card-img w-full h-full object-cover"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.endsWith("/media/product-pump.webp")) return;
            event.currentTarget.src = "/media/product-pump.webp";
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.condition === "refurbished" && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow">
              بازسازی‌شده
            </span>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow">
              فقط {product.stock} عدد
            </span>
          )}
          {!product.hasPrice && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-600 text-white shadow">
              استعلامی
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!user) return;
            toggleFavorite(product.id);
          }}
          className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-rose-500 text-white"
              : "bg-white/80 backdrop-blur text-slate-600 hover:bg-rose-500 hover:text-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Quick add to cart */}
        {product.hasPrice && product.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              const res = addToCart(product);
              if (!res.ok && res.reason) {
                alert(res.reason);
              }
            }}
            className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-gradient-to-l from-cyan-500 to-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-110"
            title="افزودن به سبد"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Content */}
      <Link to={`/product/${product.id}`} className="block p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="font-medium">{product.brand}</span>
          <span>•</span>
          <span>{product.country}</span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm leading-6 mb-2 line-clamp-2 min-h-[48px] group-hover:text-cyan-700 transition">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 leading-5 line-clamp-2 min-h-[40px] mb-3">
          {product.shortDesc}
        </p>

        {productGroup && (
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
              {productGroup.name}
            </span>
          </div>
        )}

        {/* Vessel compatibility */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.vesselTypes.slice(0, 3).map((v) => (
            <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
              ⚓ {v}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-800">{product.rating.toLocaleString("fa-IR")}</span>
          <span className="text-xs text-slate-500">({product.reviewCount.toLocaleString("fa-IR")} نظر)</span>
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-600" />
            <span className="font-medium">{product.sellerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-slate-400" />
            <span>{product.leadTime.toLocaleString("fa-IR")} روز</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3">
          <div>
            {product.hasPrice ? (
              <>
                <div className="text-[10px] text-slate-500">قیمت</div>
                <div className="text-lg font-black text-slate-900">
                  {formatPriceToman(product.price)}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] text-slate-500">وضعیت قیمت</div>
                <div className="text-base font-bold text-cyan-700">
                  نیازمند استعلام
                </div>
              </>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
              موجود
            </span>
          ) : (
            <span className="text-[10px] px-2 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold">
              ناموجود
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
