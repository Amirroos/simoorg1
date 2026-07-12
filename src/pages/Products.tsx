import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3x3, List, Sliders, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import {
  detailedSubcategories,
  getDetailedSubcategoriesForProductGroup,
  productGroups,
  vesselTypes,
} from "../data/products";
import { useApp } from "../contexts/AppContext";

export function Products() {
  const { products } = useApp();
  const [params, setParams] = useSearchParams();
  const groupParam = params.get("group") || "";
  const subcategoryParam = params.get("subcategory") || "";
  const sortParam = params.get("sort") || "";

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all");
  const [availability, setAvailability] = useState<"all" | "stock" | "inquiry">("all");
  const [condition, setCondition] = useState<"all" | "new" | "used" | "refurbished">("all");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "newest" | "rating">(sortParam === "new" ? "newest" : "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSelectedGroup(groupParam);
    setSelectedSubcategory(subcategoryParam);
  }, [groupParam, subcategoryParam]);

  useEffect(() => {
    if (sortParam === "new") setSortBy("newest");
  }, [sortParam]);

  const filtered = useMemo(() => {
    let result = products.filter((product) => product.status === "published");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => {
          const groupName = productGroups.find((group) => group.id === p.productGroupId)?.name || "";
          const subcategoryName = detailedSubcategories.find((subcategory) => subcategory.id === p.subcategoryId)?.name || "";
          return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) ||
          groupName.toLowerCase().includes(q) ||
          subcategoryName.toLowerCase().includes(q)
          );
        }
      );
    }

    if (selectedGroup) {
      result = result.filter((p) => p.productGroupId === selectedGroup);
    }

    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategoryId === selectedSubcategory);
    }

    if (selectedVessel) {
      result = result.filter((p) => p.vesselTypes.includes(selectedVessel));
    }

    if (availability === "stock") result = result.filter((p) => p.stock > 0);
    if (availability === "inquiry") result = result.filter((p) => !p.hasPrice);

    if (condition !== "all") result = result.filter((p) => p.condition === condition);

    if (priceRange === "low") result = result.filter((p) => p.price > 0 && p.price < 100_000_000);
    if (priceRange === "mid") result = result.filter((p) => p.price >= 100_000_000 && p.price < 1_000_000_000);
    if (priceRange === "high") result = result.filter((p) => p.price >= 1_000_000_000);

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
      default:
        break;
    }

    return result;
  }, [products, search, selectedGroup, selectedSubcategory, selectedVessel, priceRange, availability, condition, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedGroup("");
    setSelectedSubcategory("");
    setSelectedVessel("");
    setPriceRange("all");
    setAvailability("all");
    setCondition("all");
    setSortBy("popular");
    setParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black mb-2">بازارگاه قطعات و تجهیزات</h1>
            <p className="text-slate-300 mb-6">
              بیش از {products.filter((product) => product.status === "published").length.toLocaleString("fa-IR")} محصول در {productGroups.length.toLocaleString("fa-IR")} گروه محصول
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="نام قطعه، برند، مدل..."
                className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 focus:bg-white/15 focus:border-cyan-400 outline-none transition"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Product Group Tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedGroup("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedGroup === ""
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              همه گروه‌ها
            </button>
            {productGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group.id === selectedGroup ? "" : group.id);
                  setSelectedSubcategory("");
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  selectedGroup === group.id
                    ? "bg-cyan-700 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <FilterPanel
                selectedVessel={selectedVessel}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setSelectedVessel={setSelectedVessel}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                availability={availability}
                setAvailability={setAvailability}
                condition={condition}
                setCondition={setCondition}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 bg-white rounded-2xl p-3 border border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold transition"
                >
                  <Sliders className="w-4 h-4" />
                  فیلترها
                </button>
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{filtered.length.toLocaleString("fa-IR")}</span> کالا
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-cyan-500 outline-none"
                >
                  <option value="popular">پرفروش‌ترین</option>
                  <option value="rating">بالاترین امتیاز</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="newest">جدیدترین</option>
                </select>

                <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                      viewMode === "grid" ? "bg-white shadow" : "text-slate-500"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                      viewMode === "list" ? "bg-white shadow" : "text-slate-500"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">کالایی یافت نشد</h3>
                <p className="text-slate-500 mb-6">فیلترهای جستجو را تغییر دهید یا از دریا یار کمک بگیرید</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur"
            onClick={() => setFiltersOpen(false)}
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="absolute top-0 bottom-0 left-0 w-[85%] max-w-sm bg-white overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <h3 className="font-bold">فیلترها</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                selectedVessel={selectedVessel}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setSelectedVessel={setSelectedVessel}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                availability={availability}
                setAvailability={setAvailability}
                condition={condition}
                setCondition={setCondition}
                clearFilters={() => {
                  clearFilters();
                  setFiltersOpen(false);
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  selectedVessel: string;
  setSelectedVessel: (v: string) => void;
  selectedGroup: string;
  setSelectedGroup: (v: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (v: string) => void;
  priceRange: "all" | "low" | "mid" | "high";
  setPriceRange: (v: any) => void;
  availability: "all" | "stock" | "inquiry";
  setAvailability: (v: any) => void;
  condition: "all" | "new" | "used" | "refurbished";
  setCondition: (v: any) => void;
  clearFilters: () => void;
}

function FilterPanel(props: FilterPanelProps) {
  const visibleSubcategories = props.selectedGroup
    ? getDetailedSubcategoriesForProductGroup(props.selectedGroup)
    : detailedSubcategories;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
          فیلترها
        </h4>
        <button
          onClick={props.clearFilters}
          className="w-full text-sm text-cyan-700 hover:underline text-right mb-3"
        >
          پاک کردن همه فیلترها
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">گروه محصول</h4>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {productGroups.map((group) => (
            <label key={group.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productGroup"
                checked={props.selectedGroup === group.id}
                onChange={() => {
                  props.setSelectedGroup(props.selectedGroup === group.id ? "" : group.id);
                  props.setSelectedSubcategory("");
                }}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">{group.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">زیرگروه تخصصی</h4>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {visibleSubcategories.map((subcategory) => (
            <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="detailedSubcategory"
                checked={props.selectedSubcategory === subcategory.id}
                onChange={() => props.setSelectedSubcategory(props.selectedSubcategory === subcategory.id ? "" : subcategory.id)}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">{subcategory.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">نوع شناور</h4>
        <div className="space-y-2">
          {vesselTypes.map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vessel"
                checked={props.selectedVessel === v}
                onChange={() => props.setSelectedVessel(props.selectedVessel === v ? "" : v)}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">⚓ {v}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">محدوده قیمت</h4>
        <div className="space-y-2">
          {[
            { v: "all", label: "همه قیمت‌ها" },
            { v: "low", label: "زیر ۱۰ میلیون تومان" },
            { v: "mid", label: "۱۰ تا ۱۰۰ میلیون تومان" },
            { v: "high", label: "بالای ۱۰۰ میلیون تومان" },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={props.priceRange === opt.v}
                onChange={() => props.setPriceRange(opt.v)}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">وضعیت موجودی</h4>
        <div className="space-y-2">
          {[
            { v: "all", label: "همه" },
            { v: "stock", label: "موجود در انبار" },
            { v: "inquiry", label: "نیازمند استعلام" },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={props.availability === opt.v}
                onChange={() => props.setAvailability(opt.v)}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h4 className="font-bold text-sm mb-3">وضعیت کالا</h4>
        <div className="space-y-2">
          {[
            { v: "all", label: "همه" },
            { v: "new", label: "نو" },
            { v: "used", label: "کارکرده" },
            { v: "refurbished", label: "بازسازی‌شده" },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={props.condition === opt.v}
                onChange={() => props.setCondition(opt.v)}
                className="accent-cyan-600"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
