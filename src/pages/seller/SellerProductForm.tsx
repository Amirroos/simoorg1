import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Hash,
  Plus,
  Image as ImageIcon,
  Tag,
  Package,
  DollarSign,
  Boxes,
  Anchor,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { getCategoryIdForProductGroup, getDetailedSubcategoriesForProductGroup, marineImage, productGroups, vesselTypes } from "../../data/products";
import type { Product } from "../../data/products";

const SUGGESTED_TAGS = [
  "اصل",
  "ضمانت",
  "ارسال‌سریع",
  "موجود",
  "وارداتی",
  "تخفیف‌ویژه",
  "پرفروش",
  "تأیید‌SOLAS",
  "ضد‌خوردگی",
  "دریایی",
  "صنعتی",
  "گارانتی۳ساله",
  "بدون‌واسطه",
];

const PLACEHOLDER_IMG = marineImage("محصول دریایی جدید", "default");

export function SellerProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId") || "";
  const navigate = useNavigate();
  const { user, products, adminProductRequests, addProduct, updateProduct } = useApp();

  const existing = isEdit ? products.find((p) => p.id === id) : null;
  const adminRequest = requestId ? adminProductRequests.find((request) => request.id === requestId) : null;
  const isLockedPendingEdit = !!existing && existing.status === "pending";

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    productGroupId: "",
    subcategoryId: "",
    brand: "",
    model: "",
    country: "ایران",
    price: 0,
    hasPrice: true,
    image: PLACEHOLDER_IMG,
    stock: 1,
    vesselTypes: [] as string[],
    condition: "new" as Product["condition"],
    shortDesc: "",
    description: "",
    leadTime: 3,
    tags: [] as string[],
  });
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        categoryId: existing.categoryId,
        productGroupId: existing.productGroupId || "",
        subcategoryId: existing.subcategoryId || "",
        brand: existing.brand,
        model: existing.model,
        country: existing.country,
        price: existing.price,
        hasPrice: existing.hasPrice,
        image: existing.image,
        stock: existing.stock,
        vesselTypes: existing.vesselTypes,
        condition: existing.condition,
        shortDesc: existing.shortDesc,
        description: existing.description,
        leadTime: existing.leadTime,
        tags: existing.tags || [],
      });
      setSpecs(
        Object.entries(existing.specs).length > 0
          ? Object.entries(existing.specs).map(([k, v]) => ({ key: k, value: v }))
          : [{ key: "", value: "" }]
      );
    } else if (adminRequest) {
      setForm((prev) => ({
        ...prev,
        name: adminRequest.title,
        categoryId: getCategoryIdForProductGroup(adminRequest.productGroupId),
        productGroupId: adminRequest.productGroupId,
        subcategoryId: adminRequest.subcategoryId || "",
        brand: adminRequest.brand || "",
        model: adminRequest.model || "",
        country: adminRequest.country || prev.country,
        hasPrice: adminRequest.hasPrice,
        image: adminRequest.image || prev.image,
        vesselTypes: adminRequest.vesselTypes || [],
        condition: adminRequest.condition || prev.condition,
        shortDesc: adminRequest.shortDesc || adminRequest.description,
        description: adminRequest.description,
        leadTime: adminRequest.leadTime || prev.leadTime,
        tags: adminRequest.tags || [],
      }));
    }
  }, [existing, adminRequest]);

  const currentSubcategories = form.productGroupId
    ? getDetailedSubcategoriesForProductGroup(form.productGroupId)
    : [];

  const addTag = (tag: string) => {
    const t = tag.trim().replace(/^#/, "");
    if (!t || form.tags.includes(t)) return;
    setForm({ ...form, tags: [...form.tags, t] });
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const toggleVesselType = (v: string) => {
    setForm({
      ...form,
      vesselTypes: form.vesselTypes.includes(v)
        ? form.vesselTypes.filter((x) => x !== v)
        : [...form.vesselTypes, v],
    });
  };

  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };
  const addSpec = () => setSpecs((prev) => [...prev, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isLockedPendingEdit) {
      return setError("این محصول در انتظار تایید ادمین است و تا تعیین وضعیت، قابل ویرایش نیست.");
    }

    if (form.name.length < 5) return setError("نام محصول باید حداقل ۵ کاراکتر باشد");
    if (!form.productGroupId) return setError("گروه محصول را انتخاب کنید");
    if (form.brand.length < 2) return setError("برند را وارد کنید");
    if (form.hasPrice && form.price <= 0) return setError("قیمت باید بزرگتر از صفر باشد یا حالت 'استعلامی' را انتخاب کنید");
    if (form.stock < 0) return setError("موجودی نمی‌تواند منفی باشد");
    if (form.vesselTypes.length === 0) return setError("حداقل یک نوع شناور سازگار را انتخاب کنید");
    if (form.shortDesc.length < 10) return setError("توضیح کوتاه باید حداقل ۱۰ کاراکتر باشد");

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) specsObj[s.key.trim()] = s.value.trim();
    });

    if (isEdit && existing) {
      updateProduct(existing.id, {
        ...form,
        specs: specsObj,
      });
    } else {
      addProduct({
        name: form.name,
        categoryId: form.categoryId || getCategoryIdForProductGroup(form.productGroupId),
        productGroupId: form.productGroupId,
        subcategoryId: form.subcategoryId,
        brand: form.brand,
        model: form.model,
        country: form.country,
        price: form.hasPrice ? form.price : 0,
        hasPrice: form.hasPrice,
        image: form.image,
        stock: form.stock,
        vesselTypes: form.vesselTypes,
        condition: form.condition,
        shortDesc: form.shortDesc,
        description: form.description || form.shortDesc,
        specs: specsObj,
        leadTime: form.leadTime,
        tags: form.tags,
        sellerId: user!.id,
        sellerName: user!.companyName || user!.name,
        sellerScore: user!.rating || 5,
        status: "pending",
        workflowType: adminRequest ? "admin_request_offer" : "supplier_offer",
        adminRequestId: adminRequest?.id,
        supplierBasePrice: form.hasPrice ? form.price : 0,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/seller/products");
    }, 1200);
  };

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center shadow-xl"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {isEdit ? "محصول به‌روزرسانی شد!" : "محصول اضافه شد!"}
        </h2>
        <p className="text-slate-600 mb-1">در حال انتقال به لیست محصولات...</p>
      </motion.div>
    );
  }

  if (isLockedPendingEdit) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 text-center shadow-xl border border-amber-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle className="w-9 h-9 text-amber-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">محصول در انتظار تایید ادمین است</h2>
        <p className="text-sm text-slate-600 leading-7 mb-5">
          بعد از ارسال برای بررسی ادمین، فروشنده امکان ویرایش اطلاعات محصول را ندارد.
        </p>
        <Link
          to="/seller/products"
          className="inline-flex px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
        >
          بازگشت به محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isEdit ? "ویرایش محصول" : "افزودن محصول جدید"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? "اطلاعات محصول را ویرایش کنید" : "مشخصات کامل محصول جدید را وارد کنید"}
          </p>
        </div>
        <Link
          to="/seller/products"
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
        >
          ← بازگشت
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {adminRequest && (
            <div className="bg-cyan-50 rounded-2xl p-5 border border-cyan-100">
              <div className="text-sm font-bold text-cyan-800 mb-1">در پاسخ به درخواست ادمین</div>
              <div className="font-black text-slate-900">{adminRequest.title}</div>
              <p className="text-sm text-slate-600 mt-2 leading-7">{adminRequest.description}</p>
            </div>
          )}

          {/* اطلاعات پایه */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              اطلاعات پایه
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  نام محصول <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثلاً: پمپ آب خنک‌کننده موتور دیزل MWP-350"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  گروه محصول <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.productGroupId}
                  onChange={(e) => {
                    const productGroupId = e.target.value;
                    setForm({
                      ...form,
                      productGroupId,
                      categoryId: productGroupId ? getCategoryIdForProductGroup(productGroupId) : "",
                      subcategoryId: "",
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
                >
                  <option value="">انتخاب کنید</option>
                  {productGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">زیرگروه تخصصی</label>
                <select
                  value={form.subcategoryId}
                  onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                  disabled={!form.productGroupId || currentSubcategories.length === 0}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm disabled:opacity-50"
                >
                  <option value="">انتخاب کنید</option>
                  {currentSubcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    برند <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Westerbeke"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">مدل</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="MWP-350"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">کشور</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="هلند"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  وضعیت محصول
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "new", label: "نو" },
                    { v: "refurbished", label: "بازسازی‌شده" },
                    { v: "used", label: "کارکرده" },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setForm({ ...form, condition: c.v as any })}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                        form.condition === c.v
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* قیمت و موجودی */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              قیمت و موجودی
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasPrice: true })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    form.hasPrice
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  قیمت ثابت
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasPrice: false, price: 0 })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    !form.hasPrice
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  نیازمند استعلام
                </button>
              </div>

              {form.hasPrice && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    قیمت (ریال) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    placeholder="مثلاً 185000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                  />
                  {form.price > 0 && (
                    <div className="text-xs text-emerald-700 mt-1">
                      معادل: {Math.round(form.price / 10).toLocaleString("fa-IR")} تومان
                    </div>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <Boxes className="w-4 h-4 inline ml-1" />
                    موجودی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                  />
                  {form.stock === 0 && (
                    <div className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      با موجودی صفر، محصول به صورت «اتمام موجودی» نمایش داده می‌شود
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    زمان آماده‌سازی (روز)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.leadTime}
                    onChange={(e) => setForm({ ...form, leadTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* تگ‌ها و هشتگ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-cyan-600" />
              تگ‌ها و هشتگ‌ها
              <span className="text-xs font-normal text-slate-500">(برای پیدا کردن آسان‌تر محصول)</span>
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(newTag);
                      }
                    }}
                    placeholder="تگ خود را وارد کنید و Enter بزنید"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-l from-cyan-500 to-blue-600 text-white text-xs font-semibold"
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  پیشنهادات سریع:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-100 hover:text-cyan-700 text-slate-600 text-[11px] font-semibold transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* سازگاری شناور */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-600" />
              سازگاری با شناورها <span className="text-rose-500">*</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {vesselTypes.map((v) => {
                const selected = form.vesselTypes.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVesselType(v)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                      selected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ⚓ {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* توضیحات */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-4">توضیحات محصول</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  توضیح کوتاه <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  rows={2}
                  placeholder="معرفی کوتاه محصول در یک یا دو جمله"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  توضیحات کامل
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="توضیحات کامل محصول، کاربردها، مزایا..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* مشخصات فنی */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">مشخصات فنی</h3>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 text-sm text-purple-700 font-semibold"
              >
                <Plus className="w-4 h-4" />
                افزودن
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                    placeholder="ویژگی (مثلاً: توان)"
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    placeholder="مقدار (مثلاً: 350 لیتر بر دقیقه)"
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    disabled={specs.length === 1}
                    className="w-9 h-9 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center disabled:opacity-30 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 sticky top-20">
            {/* Image */}
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              تصویر محصول
            </h3>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
              <img src={form.image} alt="preview" className="w-full h-full object-cover" />
            </div>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value || PLACEHOLDER_IMG })}
              placeholder="آدرس URL تصویر"
              dir="ltr"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 outline-none text-xs text-left"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              می‌توانید آدرس تصویر را وارد کنید
            </p>

            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-l from-purple-600 to-pink-700 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isEdit ? "به‌روزرسانی محصول" : "افزودن به بازارگاه"}
            </button>

            <Link
              to="/seller/products"
              className="block text-center text-sm text-slate-500 mt-3 hover:text-slate-700"
            >
              انصراف
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
