import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  Grid3x3,
  List,
  Package,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import {
  detailedSubcategories,
  getDetailedSubcategoriesForProductGroup,
  productGroups,
  type Product,
} from "../data/products";
import { useApp } from "../contexts/AppContext";

type SortBy = "popular" | "price_asc" | "price_desc" | "newest" | "rating";
type ShopCondition = "" | Product["condition"];
type DeliveryStatus = "" | "fast" | "normal" | "critical";
type FilterMenu = "" | "brand" | "model" | "condition" | "delivery";

const conditionOptions: Array<{ value: ShopCondition; label: string }> = [
  { value: "", label: "همه کارکردها" },
  { value: "new", label: "نو" },
  { value: "refurbished", label: "بازسازی شده" },
  { value: "used", label: "کارکرده" },
];

const deliveryOptions: Array<{ value: DeliveryStatus; label: string; hint: string }> = [
  { value: "", label: "همه وضعیت‌ها", hint: "بدون محدودیت ارسال" },
  { value: "fast", label: "فوری", hint: "تا ۲ روز" },
  { value: "normal", label: "عادی", hint: "۳ تا ۱۴ روز" },
  { value: "critical", label: "بحرانی", hint: "بیشتر از ۱۴ روز" },
];

function deliveryStatusFor(product: Product): Exclude<DeliveryStatus, ""> {
  if (product.leadTime <= 2) return "fast";
  if (product.leadTime <= 14) return "normal";
  return "critical";
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fa"));
}

function countBy(products: Product[], key: (product: Product) => string | undefined) {
  return products.reduce<Record<string, number>>((acc, product) => {
    const value = key(product);
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function conditionLabel(value: ShopCondition) {
  return conditionOptions.find((option) => option.value === value)?.label || "همه کارکردها";
}

function deliveryLabel(value: DeliveryStatus) {
  return deliveryOptions.find((option) => option.value === value)?.label || "همه وضعیت‌ها";
}

export function Products() {
  const { products } = useApp();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(params.get("sort") === "new" ? "newest" : "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterMenu>("");

  const selectedGroup = params.get("group") || "";
  const selectedSubcategory = params.get("subcategory") || "";
  const selectedBrand = params.get("brand") || "";
  const selectedModel = params.get("model") || "";
  const selectedCondition = (params.get("condition") || "") as ShopCondition;
  const selectedDelivery = (params.get("delivery") || "") as DeliveryStatus;

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "published"),
    [products]
  );

  const selectedGroupItem = useMemo(
    () => productGroups.find((group) => group.id === selectedGroup) || null,
    [selectedGroup]
  );

  const selectedSubcategoryItem = useMemo(
    () => detailedSubcategories.find((subcategory) => subcategory.id === selectedSubcategory) || null,
    [selectedSubcategory]
  );

  const scopedProducts = useMemo(() => {
    return publishedProducts.filter((product) => {
      if (selectedGroup && product.productGroupId !== selectedGroup) return false;
      if (selectedSubcategory && product.subcategoryId !== selectedSubcategory) return false;
      return true;
    });
  }, [publishedProducts, selectedGroup, selectedSubcategory]);

  const modelScopeProducts = useMemo(() => {
    if (!selectedBrand) return scopedProducts;
    return scopedProducts.filter((product) => product.brand === selectedBrand);
  }, [scopedProducts, selectedBrand]);

  const brandCounts = useMemo(() => countBy(scopedProducts, (product) => product.brand), [scopedProducts]);
  const modelCounts = useMemo(() => countBy(modelScopeProducts, (product) => product.model), [modelScopeProducts]);
  const availableBrands = useMemo(() => uniqueValues(scopedProducts.map((product) => product.brand)), [scopedProducts]);
  const availableModels = useMemo(() => uniqueValues(modelScopeProducts.map((product) => product.model)), [modelScopeProducts]);

  const filtered = useMemo(() => {
    let result = [...scopedProducts];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((product) => {
        const groupName = productGroups.find((group) => group.id === product.productGroupId)?.name || "";
        const subcategoryName = detailedSubcategories.find((subcategory) => subcategory.id === product.subcategoryId)?.name || "";
        return (
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.model.toLowerCase().includes(q) ||
          product.shortDesc.toLowerCase().includes(q) ||
          groupName.toLowerCase().includes(q) ||
          subcategoryName.toLowerCase().includes(q)
        );
      });
    }

    if (selectedBrand) result = result.filter((product) => product.brand === selectedBrand);
    if (selectedModel) result = result.filter((product) => product.model === selectedModel);
    if (selectedCondition) result = result.filter((product) => product.condition === selectedCondition);
    if (selectedDelivery) result = result.filter((product) => deliveryStatusFor(product) === selectedDelivery);

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
  }, [scopedProducts, search, selectedBrand, selectedModel, selectedCondition, selectedDelivery, sortBy]);

  const updateParams = (updates: Record<string, string>, removeKeys: string[] = []) => {
    const next = new URLSearchParams(params);
    removeKeys.forEach((key) => next.delete(key));
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  const chooseAllProducts = () => {
    setSearch("");
    setParams({});
    setOpenFilter("");
    setShopMenuOpen(false);
  };

  const chooseGroup = (groupId: string) => {
    updateParams({ group: groupId }, ["subcategory", "brand", "model", "condition", "delivery"]);
    setOpenFilter("");
    setShopMenuOpen(false);
  };

  const chooseSubcategory = (groupId: string, subcategoryId: string) => {
    updateParams({ group: groupId, subcategory: subcategoryId }, ["brand", "model", "condition", "delivery"]);
    setOpenFilter("");
    setShopMenuOpen(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchDraft("");
    setSortBy("popular");
    setOpenFilter("");
    setParams({});
  };

  const activeFilters = [
    selectedGroupItem ? { key: "group", label: selectedGroupItem.name, clear: () => updateParams({}, ["group", "subcategory", "brand", "model", "condition", "delivery"]) } : null,
    selectedSubcategoryItem ? { key: "subcategory", label: selectedSubcategoryItem.name, clear: () => updateParams({}, ["subcategory", "brand", "model", "condition", "delivery"]) } : null,
    selectedBrand ? { key: "brand", label: selectedBrand, clear: () => updateParams({ brand: "" }, ["model"]) } : null,
    selectedModel ? { key: "model", label: selectedModel, clear: () => updateParams({ model: "" }) } : null,
    selectedCondition ? { key: "condition", label: conditionLabel(selectedCondition), clear: () => updateParams({ condition: "" }) } : null,
    selectedDelivery ? { key: "delivery", label: deliveryLabel(selectedDelivery), clear: () => updateParams({ delivery: "" }) } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <AnimatePresence>
        {shopMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none fixed inset-0 z-20 bg-slate-950/35"
          />
        )}
      </AnimatePresence>

      <section
        className="relative z-30 border-b border-slate-200 bg-white"
        onMouseLeave={() => setShopMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 mb-2">
                <Store className="w-4 h-4" />
                فروشگاه تخصصی تجهیزات دریایی
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-950">فروشگاه محصولات</h1>
              <button
                type="button"
                onMouseEnter={() => setShopMenuOpen(true)}
                onFocus={() => setShopMenuOpen(true)}
                className={`mt-4 h-12 rounded-xl border px-4 text-sm font-black transition flex items-center justify-center gap-2 ${
                  shopMenuOpen
                    ? "border-cyan-600 bg-cyan-600 text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:border-cyan-300 hover:text-cyan-700"
                }`}
              >
                <PackageSearch className="w-5 h-5" />
                دسته‌بندی کالاها
                <ChevronDown className={`w-4 h-4 transition ${shopMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(searchDraft.trim());
              }}
              className="relative w-full lg:w-[620px]"
            >
              <div className="absolute inset-x-10 -bottom-2 h-5 rounded-full bg-cyan-300/35 blur-xl" />
              <div className="relative flex h-12 overflow-hidden rounded-xl border border-cyan-100 bg-white shadow-[0_14px_34px_rgba(14,165,233,0.14)] transition focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <input
                  type="text"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="جستجو در نام قطعه، برند یا مدل..."
                  className="h-full min-w-0 flex-1 bg-white pr-12 pl-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="relative m-1.5 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-700"
                >
                  <span className="absolute inset-x-3 -bottom-2 h-3 rounded-full bg-cyan-300/55 blur-md" />
                  <span className="relative">جست‌وجوی کالا</span>
                </button>
              </div>
            </form>
          </div>

          <div className="relative z-40">
            <AnimatePresence>
              {shopMenuOpen && (
                <ShopMegaMenu
                  products={publishedProducts}
                  selectedGroup={selectedGroup}
                  selectedSubcategory={selectedSubcategory}
                  onClose={() => setShopMenuOpen(false)}
                  onChooseAll={chooseAllProducts}
                  onChooseGroup={chooseGroup}
                  onChooseSubcategory={chooseSubcategory}
                  onShowGroup={chooseGroup}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {activeFilters.length === 0 ? (
              <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
                نمایش همه محصولات فروشگاه
              </span>
            ) : (
              activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:border-cyan-200 hover:bg-cyan-100 transition"
                >
                  {filter.label}
                  <X className="w-3.5 h-3.5" />
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-200 hover:text-rose-600 transition"
          >
            <RotateCcw className="w-4 h-4" />
            پاک کردن فیلترها
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            فیلترهای فروشگاه
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            <DropdownFilter
              id="brand"
              label="برند"
              placeholder="همه برندها"
              value={selectedBrand}
              open={openFilter === "brand"}
              onToggle={() => setOpenFilter(openFilter === "brand" ? "" : "brand")}
              options={[
                { value: "", label: "همه برندها", count: scopedProducts.length },
                ...availableBrands.map((brand) => ({ value: brand, label: brand, count: brandCounts[brand] || 0 })),
              ]}
              onChange={(value) => {
                updateParams({ brand: value }, ["model"]);
                setOpenFilter("");
              }}
            />

            <DropdownFilter
              id="model"
              label="مدل سازنده"
              placeholder="همه مدل‌ها"
              value={selectedModel}
              open={openFilter === "model"}
              onToggle={() => setOpenFilter(openFilter === "model" ? "" : "model")}
              options={[
                { value: "", label: "همه مدل‌ها", count: modelScopeProducts.length },
                ...availableModels.map((model) => ({ value: model, label: model, count: modelCounts[model] || 0 })),
              ]}
              onChange={(value) => {
                updateParams({ model: value });
                setOpenFilter("");
              }}
            />

            <DropdownFilter
              id="condition"
              label="کارکرد"
              placeholder="همه کارکردها"
              value={selectedCondition}
              open={openFilter === "condition"}
              onToggle={() => setOpenFilter(openFilter === "condition" ? "" : "condition")}
              options={conditionOptions.map((option) => ({
                value: option.value,
                label: option.label,
                count: option.value ? scopedProducts.filter((product) => product.condition === option.value).length : scopedProducts.length,
              }))}
              onChange={(value) => {
                updateParams({ condition: value });
                setOpenFilter("");
              }}
            />

            <DropdownFilter
              id="delivery"
              label="وضعیت ارسال"
              placeholder="همه وضعیت‌ها"
              value={selectedDelivery}
              open={openFilter === "delivery"}
              onToggle={() => setOpenFilter(openFilter === "delivery" ? "" : "delivery")}
              options={deliveryOptions.map((option) => ({
                value: option.value,
                label: option.label,
                hint: option.hint,
                count: option.value ? scopedProducts.filter((product) => deliveryStatusFor(product) === option.value).length : scopedProducts.length,
              }))}
              onChange={(value) => {
                updateParams({ delivery: value });
                setOpenFilter("");
              }}
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-black text-slate-950">{filtered.length.toLocaleString("fa-IR")}</span> کالا نمایش داده می‌شود
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500"
            >
              <option value="popular">پرفروش‌ترین</option>
              <option value="rating">بالاترین امتیاز</option>
              <option value="price_asc">ارزان‌ترین</option>
              <option value="price_desc">گران‌ترین</option>
              <option value="newest">جدیدترین</option>
            </select>

            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                  viewMode === "grid" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500"
                }`}
                title="نمایش شبکه‌ای"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                  viewMode === "list" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500"
                }`}
                title="نمایش فهرستی"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <PackageSearch className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-xl font-black text-slate-900 mb-2">کالایی پیدا نشد</h3>
            <p className="text-sm text-slate-500 mb-5">فیلترها را تغییر دهید یا دسته‌بندی دیگری را انتخاب کنید.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800 transition"
            >
              نمایش همه محصولات
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ShopMegaMenuProps {
  products: Product[];
  selectedGroup: string;
  selectedSubcategory: string;
  onClose: () => void;
  onChooseAll: () => void;
  onChooseGroup: (groupId: string) => void;
  onChooseSubcategory: (groupId: string, subcategoryId: string) => void;
  onShowGroup: (groupId: string) => void;
}

function ShopMegaMenu({
  products,
  selectedGroup,
  selectedSubcategory,
  onClose,
  onChooseAll,
  onChooseGroup,
  onChooseSubcategory,
  onShowGroup,
}: ShopMegaMenuProps) {
  const [previewGroup, setPreviewGroup] = useState(selectedGroup);
  const groupCounts = useMemo(() => countBy(products, (product) => product.productGroupId), [products]);
  const selectedGroupItem = productGroups.find((group) => group.id === previewGroup) || productGroups[0];
  const subcategories = previewGroup ? getDetailedSubcategoriesForProductGroup(previewGroup) : [];
  const subcategoryCounts = useMemo(
    () => countBy(products.filter((product) => !previewGroup || product.productGroupId === previewGroup), (product) => product.subcategoryId),
    [products, previewGroup]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 left-0 top-0 z-40 pt-3"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-cyan-700" />
          <span className="text-sm font-black text-slate-900">انتخاب دسته‌بندی فروشگاه</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          title="بستن"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid min-h-[420px] lg:grid-cols-[290px_1fr]">
        <aside className="border-b border-slate-100 bg-slate-50 lg:border-b-0 lg:border-l">
          <button
            type="button"
            onMouseEnter={() => setPreviewGroup("")}
            onFocus={() => setPreviewGroup("")}
            onClick={onChooseAll}
            className={`flex w-full items-center justify-between px-4 py-3 text-right text-sm font-black transition ${
              !previewGroup ? "bg-white text-cyan-700" : "text-slate-700 hover:bg-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              همه محصولات فروشگاه
            </span>
            <span className="text-xs text-slate-400">{products.length.toLocaleString("fa-IR")}</span>
          </button>

          <div className="max-h-[500px] overflow-y-auto py-2">
            {productGroups.map((group) => {
              const active = previewGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onMouseEnter={() => setPreviewGroup(group.id)}
                  onFocus={() => setPreviewGroup(group.id)}
                  onClick={() => onChooseGroup(group.id)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm transition ${
                    active ? "bg-white text-cyan-700 shadow-sm" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-cyan-50 text-cyan-700" : "bg-white text-slate-500"}`}>
                      <Package className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate font-bold">{group.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                    {(groupCounts[group.id] || 0).toLocaleString("fa-IR")}
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={previewGroup || "all-products"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="h-full"
            >
          {!previewGroup ? (
            <div className="grid h-full place-items-center rounded-2xl bg-slate-50 px-5 text-center">
              <div>
                <PackageSearch className="mx-auto mb-4 h-14 w-14 text-cyan-600" />
                <h3 className="mb-2 text-xl font-black text-slate-950">از تب اول گروه محصولات را انتخاب کنید</h3>
                <p className="mx-auto max-w-md text-sm leading-7 text-slate-500">
                  بعد از انتخاب گروه، همین مگا منو باز می‌ماند تا دسته‌بندی تخصصی همان گروه را انتخاب کنید.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-950 text-white">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={selectedGroupItem.image}
                    alt={selectedGroupItem.name}
                    className="h-full w-full object-cover opacity-75"
                    onError={(event) => {
                      event.currentTarget.src = "/media/cat-other.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4">
                    <div className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-cyan-100 backdrop-blur">
                      گروه محصول
                    </div>
                    <h3 className="text-lg font-black leading-7">{selectedGroupItem.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => onShowGroup(previewGroup)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-50 transition"
                  >
                    نمایش همه محصولات این گروه
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-black text-slate-950">دسته‌بندی تخصصی</h4>
                    <p className="mt-1 text-sm text-slate-500">با انتخاب دسته‌بندی، منو بسته می‌شود و محصولات همان بخش نمایش داده می‌شوند.</p>
                  </div>
                  {selectedSubcategory && (
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">انتخاب شده</span>
                  )}
                </div>

                {subcategories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    برای این گروه هنوز دسته‌بندی تخصصی ثبت نشده است.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {subcategories.map((subcategory) => {
                      const active = selectedSubcategory === subcategory.id;
                      return (
                        <button
                          key={subcategory.id}
                          type="button"
                          onClick={() => onChooseSubcategory(previewGroup, subcategory.id)}
                          className={`min-h-[76px] rounded-xl border px-4 py-3 text-right transition ${
                            active
                              ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/60"
                          }`}
                        >
                          <span className="mb-2 flex items-center justify-between gap-2">
                            <span className="font-black leading-6">{subcategory.name}</span>
                            <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" />
                          </span>
                          <span className="text-xs text-slate-400">
                            {(subcategoryCounts[subcategory.id] || 0).toLocaleString("fa-IR")} کالا
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
  count?: number;
}

interface DropdownFilterProps {
  id: FilterMenu;
  label: string;
  placeholder: string;
  value: string;
  open: boolean;
  options: DropdownOption[];
  onToggle: () => void;
  onChange: (value: string) => void;
}

function DropdownFilter({
  label,
  placeholder,
  value,
  open,
  options,
  onToggle,
  onChange,
}: DropdownFilterProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 text-right transition ${
          open || value
            ? "border-cyan-300 bg-cyan-50 text-cyan-800"
            : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-bold text-slate-400">{label}</span>
          <span className="block truncate text-sm font-black">{selected?.label || placeholder}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 max-h-72 w-full min-w-[230px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
          {options.map((option) => (
            <button
              key={`${label}-${option.value || "all"}`}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-right text-sm transition ${
                value === option.value ? "bg-cyan-50 text-cyan-800" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-bold">{option.label}</span>
                {option.hint && <span className="block text-xs text-slate-400">{option.hint}</span>}
              </span>
              {typeof option.count === "number" && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {option.count.toLocaleString("fa-IR")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
