import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Edit3, AlertTriangle, Hash, Package } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useSellerProducts } from "./SellerLayout";
import { formatPriceToman } from "../../data/products";

export function SellerProducts() {
  const { deleteProduct, updateProduct } = useApp();
  const myProducts = useSellerProducts();
  const [search, setSearch] = useState("");

  const filtered = myProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adjustStock = (id: string, delta: number) => {
    const p = myProducts.find((x) => x.id === id);
    if (!p) return;
    updateProduct(id, { stock: Math.max(0, p.stock + delta) });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`حذف محصول "${name}" را تأیید می‌کنید؟`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">محصولات من</h1>
          <p className="text-sm text-slate-500">
            {myProducts.length.toLocaleString("fa-IR")} محصول در فروشگاه شما
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-l from-purple-600 to-pink-700 text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          افزودن محصول
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در محصولات من..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold mb-2">محصولی نیست</h3>
          <p className="text-sm text-slate-500 mb-4">اولین محصول خود را اضافه کنید</p>
          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            افزودن محصول جدید
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative aspect-video bg-slate-100">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-rose-500/80 flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-white text-rose-600 font-bold text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      اتمام موجودی
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-800 line-clamp-2 min-h-[40px] mb-2">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <span>{p.brand}</span>•<span>{p.model}</span>
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="text-cyan-700 font-black text-sm">
                    {p.hasPrice ? formatPriceToman(p.price) : "استعلامی"}
                  </div>
                  <div className={`text-xs font-bold ${
                    p.stock === 0 ? "text-rose-600" : p.stock < 5 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {p.stock === 0 ? "ناموجود" : `${p.stock.toLocaleString("fa-IR")} عدد`}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => adjustStock(p.id, -1)}
                    disabled={p.stock === 0}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold transition disabled:opacity-30"
                  >
                    − ۱
                  </button>
                  <button
                    onClick={() => adjustStock(p.id, 1)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold transition"
                  >
                    + ۱
                  </button>
                  <button
                    onClick={() => adjustStock(p.id, 10)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold transition"
                  >
                    + ۱۰
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/seller/products/edit/${p.id}`}
                    className="flex-1 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    ویرایش
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
