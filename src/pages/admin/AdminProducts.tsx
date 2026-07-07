import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, Eye, Package, AlertTriangle, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { formatPriceToman, productGroups } from "../../data/products";

export function AdminProducts() {
  const { products, deleteProduct, updateProduct } = useApp();
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "in" | "low" | "out">("all");

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGroup && p.productGroupId !== filterGroup) return false;
    if (filterStock === "in" && p.stock < 5) return false;
    if (filterStock === "low" && (p.stock === 0 || p.stock >= 5)) return false;
    if (filterStock === "out" && p.stock > 0) return false;
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`آیا از حذف محصول "${name}" مطمئن هستید؟`)) {
      deleteProduct(id);
    }
  };

  const adjustStock = (id: string, delta: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    updateProduct(id, { stock: newStock });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت محصولات</h1>
          <p className="text-sm text-slate-500">
            مجموع {products.length.toLocaleString("fa-IR")} محصول در بازارگاه
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام محصول، برند..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
          >
            <option value="">همه گروه‌ها</option>
            {productGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
          >
            <option value="all">همه موجودی‌ها</option>
            <option value="in">موجود (≥۵)</option>
            <option value="low">موجودی کم (۱-۴)</option>
            <option value="out">اتمام موجودی</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>محصولی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">محصول</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 hidden md:table-cell">فروشنده</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 hidden lg:table-cell">تگ‌ها</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">قیمت</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">موجودی</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                          <div className="text-xs text-slate-500">
                            {p.brand} • {p.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-xs text-slate-700 font-semibold">{p.sellerName}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(p.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold">
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                        {(!p.tags || p.tags.length === 0) && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-cyan-700 whitespace-nowrap">
                        {p.hasPrice ? formatPriceToman(p.price) : "استعلامی"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700"
                        >
                          −
                        </button>
                        <span className={`min-w-[40px] text-center font-bold text-sm ${
                          p.stock === 0 ? "text-rose-600" : p.stock < 5 ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {p.stock.toLocaleString("fa-IR")}
                        </span>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700"
                        >
                          +
                        </button>
                      </div>
                      {p.stock === 0 && (
                        <div className="text-[10px] text-rose-600 font-bold mt-1 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          اتمام موجودی
                        </div>
                      )}
                      {p.stock > 0 && p.stock < 5 && (
                        <div className="text-[10px] text-amber-600 font-semibold mt-1">
                          فقط {p.stock.toLocaleString("fa-IR")} عدد
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/product/${p.id}`}
                          target="_blank"
                          className="w-8 h-8 rounded-lg hover:bg-cyan-50 text-cyan-700 flex items-center justify-center transition"
                          title="مشاهده"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 text-center">
        نمایش {filtered.length.toLocaleString("fa-IR")} از {products.length.toLocaleString("fa-IR")} محصول
      </div>
    </div>
  );
}
