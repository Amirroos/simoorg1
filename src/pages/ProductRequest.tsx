import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Anchor,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  PackageCheck,
  PackageSearch,
  RotateCcw,
  Search,
  Send,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../contexts/AppContext";
import {
  getCategoryIdForProductGroup,
  getDetailedSubcategoriesForProductGroup,
  vesselTypes,
  type Product,
} from "../data/products";
import {
  getSheetCatalogCategories,
  getSheetCatalogSubgroups,
  mapSheetGroupToLegacyProductGroup,
  sheetCatalogGroups,
} from "../data/sheetCatalog";

type RequestCondition = "" | Product["condition"];

interface RequestDiscoveryForm {
  productGroupId: string;
  subcategoryId: string;
  productChoice: string;
  customProductName: string;
  brand: string;
  model: string;
  condition: RequestCondition;
  vesselType: string;
  qty: number;
  unit: string;
  urgency: string;
  neededBy: string;
  deliveryLocation: string;
  specs: string;
  description: string;
}

const OTHER_PRODUCT = "__other_product__";
const deliveryLocations = [
  "بندرعباس",
  "بندر شهید رجایی",
  "بندر امام خمینی",
  "بوشهر",
  "خرمشهر",
  "چابهار",
  "بندر انزلی",
  "امیرآباد",
  "قشم",
  "کیش",
  "تهران",
  "سایر شهرها",
];
const quantityOptions = [1, 2, 5, 10, 20, 50, 100];

const emptyForm: RequestDiscoveryForm = {
  productGroupId: "",
  subcategoryId: "",
  productChoice: "",
  customProductName: "",
  brand: "",
  model: "",
  condition: "",
  vesselType: "",
  qty: 1,
  unit: "عدد",
  urgency: "normal",
  neededBy: "",
  deliveryLocation: "",
  specs: "",
  description: "",
};

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fa"));
}

function conditionLabel(condition: Product["condition"]) {
  if (condition === "used") return "کارکرده";
  if (condition === "refurbished") return "بازسازی‌شده";
  return "نو";
}

export function ProductRequest() {
  const { products, user, addRFQ } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RequestDiscoveryForm>(emptyForm);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "published"),
    [products]
  );

  const subcategories = useMemo(
    () => form.productGroupId ? getSheetCatalogSubgroups(form.productGroupId) : [],
    [form.productGroupId]
  );

  const groupProducts = useMemo(
    () => form.productGroupId
      ? publishedProducts.filter((product) => product.catalogGroupId === form.productGroupId)
      : publishedProducts,
    [form.productGroupId, publishedProducts]
  );

  const subcategoryProducts = useMemo(
    () => form.subcategoryId
      ? groupProducts.filter((product) => product.catalogSubgroupId === form.subcategoryId)
      : groupProducts,
    [form.subcategoryId, groupProducts]
  );

  const productNameOptions = useMemo(
    () => form.productGroupId && form.subcategoryId
      ? getSheetCatalogCategories(form.productGroupId, form.subcategoryId).map((category) => category.name)
      : [],
    [form.productGroupId, form.subcategoryId]
  );

  const brandOptions = useMemo(
    () => uniqueValues(subcategoryProducts.map((product) => product.brand)),
    [subcategoryProducts]
  );

  const modelOptions = useMemo(
    () => uniqueValues(subcategoryProducts.map((product) => product.model)),
    [subcategoryProducts]
  );

  const matchingProducts = useMemo(() => {
    if (form.productChoice === OTHER_PRODUCT) return [];

    return publishedProducts
      .filter((product) => {
        if (form.productGroupId && product.catalogGroupId !== form.productGroupId) return false;
        if (form.subcategoryId && product.catalogSubgroupId !== form.subcategoryId) return false;
        if (form.productChoice && product.catalogCategory !== form.productChoice) return false;
        if (form.brand && product.brand !== form.brand) return false;
        if (form.model && product.model !== form.model) return false;
        if (form.condition && product.condition !== form.condition) return false;
        if (
          form.vesselType &&
          !product.vesselTypes.includes(form.vesselType) &&
          !product.vesselTypes.includes("سایر شناورها")
        ) return false;
        if (form.qty > product.stock) return false;
        if (form.urgency === "critical" && product.leadTime > 2) return false;
        if (form.urgency === "urgent" && product.leadTime > 5) return false;
        return product.stock > 0;
      })
      .sort((a, b) => b.rating - a.rating || a.leadTime - b.leadTime);
  }, [form, publishedProducts]);

  const discoveryCriteriaCount = [
    form.productGroupId,
    form.subcategoryId,
    form.productChoice,
    form.brand,
    form.model,
    form.condition,
    form.vesselType,
    form.qty > 1 ? String(form.qty) : "",
    form.urgency !== "normal" ? form.urgency : "",
  ].filter(Boolean).length;

  const selectedGroup = sheetCatalogGroups.find((group) => group.id === form.productGroupId);
  const selectedSubcategory = subcategories.find((subcategory) => subcategory.id === form.subcategoryId);
  const legacyProductGroupId = selectedGroup ? mapSheetGroupToLegacyProductGroup(selectedGroup.name) : "";
  const legacySubcategoryId =
    publishedProducts.find(
      (product) =>
        product.catalogGroupId === form.productGroupId &&
        product.catalogSubgroupId === form.subcategoryId &&
        (!form.productChoice || form.productChoice === OTHER_PRODUCT || product.catalogCategory === form.productChoice)
    )?.subcategoryId ||
    getDetailedSubcategoriesForProductGroup(legacyProductGroupId)[0]?.id ||
    "";
  const requestedProductName =
    form.productChoice === OTHER_PRODUCT
      ? form.customProductName.trim()
      : form.productChoice || selectedSubcategory?.name || "";

  const update = (patch: Partial<RequestDiscoveryForm>) => {
    setError("");
    setForm((current) => ({ ...current, ...patch }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setStep(0);
    setError("");
    setSubmittedId("");
  };

  const validateStep = () => {
    if (
      step === 0 &&
      (
        !form.productGroupId ||
        !form.subcategoryId ||
        !form.productChoice ||
        (form.productChoice === OTHER_PRODUCT && !form.customProductName.trim())
      )
    ) {
      setError("گروه، زیرگروه و نام یا نوع کالای موردنیاز را انتخاب کنید.");
      return false;
    }

    if (step === 1 && (!form.vesselType || form.qty < 1 || !form.deliveryLocation)) {
      setError("نوع شناور، تعداد و محل تحویل را کامل کنید.");
      return false;
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(2, current + 1));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep()) return;

    if (matchingProducts.length > 0) {
      setError("کالای منطبق در فروشگاه موجود است؛ یکی از نتایج پایین صفحه را برای خرید انتخاب کنید.");
      return;
    }

    if (!user) {
      setError("برای ثبت درخواست ابتدا وارد حساب خریدار شوید؛ اطلاعات این صفحه حفظ می‌شود.");
      window.dispatchEvent(new CustomEvent("openAuthModal"));
      return;
    }

    if (user.role !== "buyer") {
      setError("ثبت درخواست تأمین فقط از حساب خریدار امکان‌پذیر است.");
      return;
    }

    const rfq = addRFQ({
      requestType: "missing_product",
      productName: requestedProductName,
      title: `درخواست تأمین ${requestedProductName}`,
      categoryId: getCategoryIdForProductGroup(legacyProductGroupId),
      productGroupId: legacyProductGroupId,
      subcategoryId: legacySubcategoryId,
      brand: form.brand || "بدون ترجیح",
      model: form.model,
      condition: form.condition || undefined,
      vesselType: form.vesselType,
      urgency: form.urgency,
      neededBy: form.neededBy,
      deliveryLocation: form.deliveryLocation,
      description: form.description.trim() || form.specs.trim() || `درخواست تأمین ${requestedProductName}`,
      items: [{
        id: `item-${Date.now()}`,
        name: requestedProductName,
        qty: form.qty,
        unit: form.unit,
        specs: [
          selectedGroup ? `گروه: ${selectedGroup.name}` : "",
          selectedSubcategory ? `زیرگروه: ${selectedSubcategory.name}` : "",
          form.brand ? `برند: ${form.brand}` : "برند: بدون ترجیح",
          form.model ? `مدل: ${form.model}` : "",
          form.condition ? `وضعیت: ${conditionLabel(form.condition)}` : "وضعیت: بدون ترجیح",
          form.specs.trim(),
        ].filter(Boolean).join(" | "),
      }],
    });

    if (!rfq) {
      setError("ثبت درخواست انجام نشد. دوباره تلاش کنید.");
      return;
    }

    setSubmittedId(rfq.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const productsQuery = new URLSearchParams();
  if (legacyProductGroupId) productsQuery.set("group", legacyProductGroupId);
  if (legacySubcategoryId) productsQuery.set("subcategory", legacySubcategoryId);
  if (form.brand) productsQuery.set("brand", form.brand);
  if (form.model) productsQuery.set("model", form.model);
  if (form.condition) productsQuery.set("condition", form.condition);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 pb-16" dir="rtl">
      <section className="relative overflow-hidden border-b border-cyan-900/40 bg-gradient-to-bl from-slate-950 via-cyan-950 to-blue-950 text-white">
        <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <PackageSearch className="absolute -bottom-16 left-8 h-72 w-72 -rotate-12 text-white/[0.035]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
          <div className="mb-7 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
            <Link to="/products" className="rounded-xl px-5 py-2.5 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white">
              محصولات
            </Link>
            <span className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-cyan-950 shadow-lg">
              ثبت درخواست
            </span>
          </div>
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-200 ring-1 ring-cyan-300/20">
              <Sparkles className="h-4 w-4" />
              جست‌وجوی هوشمند و درخواست تأمین در یک مسیر
            </div>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">اول پیدا کن، اگر نبود درخواست بده</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
              هر انتخاب، تمام محصولات بازارگاه را همان لحظه فیلتر می‌کند. اگر کالای مناسب موجود باشد مستقیم خرید کنید؛ اگر نتیجه‌ای نبود، همان اطلاعات به درخواست تأمین تبدیل می‌شود.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {submittedId ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl"
          >
            <div className="bg-gradient-to-l from-emerald-600 to-cyan-700 px-6 py-8 text-white md:px-10">
              <CheckCircle2 className="h-14 w-14" />
              <h2 className="mt-4 text-2xl font-black md:text-3xl">درخواست با موفقیت ثبت شد</h2>
              <p className="mt-2 text-sm text-emerald-50">
                کد پیگیری شما <span dir="ltr" className="rounded-lg bg-white/15 px-2 py-1 font-black">{submittedId}</span> است.
              </p>
            </div>
            <div className="p-6 md:p-10">
              <div className="grid gap-3 text-center text-xs font-black text-slate-500 sm:grid-cols-4">
                {["بررسی ادمین", "استعلام تأمین", "انتخاب پیشنهاد", "تأیید و خرید"].map((label, index) => (
                  <div key={label} className={`rounded-2xl px-3 py-4 ${index === 0 ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100"}`}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/my-rfqs" className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-black text-white">پیگیری درخواست</Link>
                <button type="button" onClick={resetForm} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700">ثبت درخواست جدید</button>
              </div>
            </div>
          </motion.section>
        ) : (
          <>
            <form onSubmit={submit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/80 p-4 md:p-6">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: PackageSearch, label: "انتخاب و فیلتر کالا" },
                    { icon: Anchor, label: "نیاز و تحویل" },
                    { icon: ClipboardCheck, label: "بررسی و ثبت" },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center justify-center gap-2 rounded-2xl px-2 py-3 text-[10px] font-black transition sm:text-xs ${
                          step === index
                            ? "bg-slate-950 text-white shadow-lg"
                            : step > index
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-white text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {step > index ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 md:p-7">
                {step === 0 && (
                  <div>
                    <SectionTitle
                      icon={SlidersHorizontal}
                      title="مشخصات کالای موردنیاز"
                      description="فیلدها را به‌ترتیب انتخاب کنید؛ نتیجه محصولات پایین صفحه هم‌زمان تغییر می‌کند."
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Field label="گروه محصول" required>
                        <select
                          value={form.productGroupId}
                          onChange={(event) => update({
                            productGroupId: event.target.value,
                            subcategoryId: "",
                            productChoice: "",
                            customProductName: "",
                            brand: "",
                            model: "",
                          })}
                          className="input-shell"
                        >
                          <option value="">انتخاب گروه محصول</option>
                          {sheetCatalogGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                        </select>
                      </Field>

                      <Field label="زیرگروه" required>
                        <select
                          value={form.subcategoryId}
                          disabled={!form.productGroupId}
                          onChange={(event) => update({
                            subcategoryId: event.target.value,
                            productChoice: "",
                            customProductName: "",
                            brand: "",
                            model: "",
                          })}
                          className="input-shell disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">انتخاب زیرگروه</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="نام یا نوع کالا" required>
                        <select
                          value={form.productChoice}
                          disabled={!form.subcategoryId}
                          onChange={(event) => update({
                            productChoice: event.target.value,
                            customProductName: "",
                            brand: "",
                            model: "",
                          })}
                          className="input-shell disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">انتخاب از کالاهای این زیرگروه</option>
                          {productNameOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                          <option value={OTHER_PRODUCT}>کالای دیگری که در فهرست نیست</option>
                        </select>
                      </Field>

                      {form.productChoice === OTHER_PRODUCT && (
                        <Field label="نام کالای خارج از فهرست" required>
                          <input
                            value={form.customProductName}
                            onChange={(event) => update({ customProductName: event.target.value })}
                            className="input-shell"
                            placeholder="نام دقیق یا پارت نامبر را وارد کنید"
                          />
                        </Field>
                      )}

                      <Field label="برند">
                        <select
                          value={form.brand}
                          disabled={!form.subcategoryId}
                          onChange={(event) => update({ brand: event.target.value, model: "" })}
                          className="input-shell disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">بدون ترجیح / همه برندها</option>
                          {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                      </Field>

                      <Field label="مدل / پارت نامبر">
                        <select
                          value={form.model}
                          disabled={!form.subcategoryId}
                          onChange={(event) => update({ model: event.target.value })}
                          className="input-shell disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">بدون ترجیح / همه مدل‌ها</option>
                          {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                        </select>
                      </Field>

                      <Field label="وضعیت کالا">
                        <select
                          value={form.condition}
                          onChange={(event) => update({ condition: event.target.value as RequestCondition })}
                          className="input-shell"
                        >
                          <option value="">بدون ترجیح / همه وضعیت‌ها</option>
                          <option value="new">نو</option>
                          <option value="refurbished">بازسازی‌شده</option>
                          <option value="used">کارکرده</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <SectionTitle
                      icon={Anchor}
                      title="نیاز عملیاتی و تحویل"
                      description="تعداد، نوع شناور و فوریت نیز موجودی و زمان ارسال محصولات را فیلتر می‌کنند."
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Field label="نوع شناور" required>
                        <select value={form.vesselType} onChange={(event) => update({ vesselType: event.target.value })} className="input-shell">
                          <option value="">انتخاب نوع شناور</option>
                          {vesselTypes.map((vessel) => <option key={vessel} value={vessel}>{vessel}</option>)}
                        </select>
                      </Field>

                      <Field label="تعداد موردنیاز" required>
                        <select value={form.qty} onChange={(event) => update({ qty: Number(event.target.value) })} className="input-shell">
                          {quantityOptions.map((quantity) => <option key={quantity} value={quantity}>{quantity.toLocaleString("fa-IR")}</option>)}
                        </select>
                      </Field>

                      <Field label="واحد">
                        <select value={form.unit} onChange={(event) => update({ unit: event.target.value })} className="input-shell">
                          {["عدد", "دستگاه", "ست", "متر", "کیلوگرم", "لیتر", "بسته"].map((unit) => <option key={unit}>{unit}</option>)}
                        </select>
                      </Field>

                      <Field label="اولویت تأمین">
                        <select value={form.urgency} onChange={(event) => update({ urgency: event.target.value })} className="input-shell">
                          <option value="normal">عادی — بدون محدودیت زمان ارسال</option>
                          <option value="urgent">فوری — حداکثر ۵ روز</option>
                          <option value="critical">اضطراری — حداکثر ۲ روز</option>
                        </select>
                      </Field>

                      <Field label="تاریخ موردنیاز">
                        <input type="date" value={form.neededBy} onChange={(event) => update({ neededBy: event.target.value })} className="input-shell" />
                      </Field>

                      <Field label="محل تحویل" required>
                        <select value={form.deliveryLocation} onChange={(event) => update({ deliveryLocation: event.target.value })} className="input-shell">
                          <option value="">انتخاب بندر یا شهر تحویل</option>
                          {deliveryLocations.map((location) => <option key={location}>{location}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <SectionTitle
                      icon={ClipboardCheck}
                      title="بررسی نهایی"
                      description="مشخصات فنی آزاد است؛ اطلاعات انتخاب‌شده به‌صورت خودکار به درخواست پیوست می‌شود."
                    />

                    <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600 md:grid-cols-3">
                      <SummaryItem label="کالا" value={requestedProductName || "—"} />
                      <SummaryItem label="گروه و زیرگروه" value={`${selectedGroup?.name || "—"} / ${selectedSubcategory?.name || "—"}`} />
                      <SummaryItem label="تعداد و تحویل" value={`${form.qty.toLocaleString("fa-IR")} ${form.unit} / ${form.deliveryLocation || "—"}`} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="مشخصات فنی">
                        <textarea
                          value={form.specs}
                          onChange={(event) => update({ specs: event.target.value })}
                          className="input-shell min-h-32 resize-y"
                          placeholder="توان، ولتاژ، ابعاد، استاندارد یا هر مشخصه مهم..."
                        />
                      </Field>
                      <Field label="توضیحات تکمیلی">
                        <textarea
                          value={form.description}
                          onChange={(event) => update({ description: event.target.value })}
                          className="input-shell min-h-32 resize-y"
                          placeholder="شرایط مورد قبول، جایگزین مجاز یا نکته تکمیلی..."
                        />
                      </Field>
                    </div>

                    {matchingProducts.length > 0 ? (
                      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
                        <PackageCheck className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <strong>{matchingProducts.length.toLocaleString("fa-IR")} کالای منطبق موجود است.</strong>
                          <p className="text-xs text-emerald-700">ثبت درخواست لازم نیست؛ از نتایج پایین صفحه کالا را انتخاب و خریداری کنید.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                        <FilePlus2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <strong>کالای منطبق پیدا نشد؛ درخواست آماده ثبت است.</strong>
                          <p className="text-xs text-amber-800">همین فیلترها و مشخصات برای ادمین فروش و تأمین‌کنندگان ارسال می‌شود.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold leading-6 text-rose-700">
                    {error}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={step === 0}
                      onClick={() => {
                        setError("");
                        setStep((current) => Math.max(0, current - 1));
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                      مرحله قبل
                    </button>
                    <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-black text-slate-500 hover:bg-slate-100">
                      <RotateCcw className="h-4 w-4" />
                      پاک‌کردن
                    </button>
                  </div>

                  {step < 2 ? (
                    <button type="button" onClick={nextStep} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800">
                      مرحله بعد
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : matchingProducts.length > 0 ? (
                    <a href="#matching-products" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
                      <ShoppingCart className="h-4 w-4" />
                      انتخاب از محصولات موجود
                    </a>
                  ) : (
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-700 to-blue-800 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-700/20">
                      <Send className="h-4 w-4" />
                      ثبت درخواست تأمین
                    </button>
                  )}
                </div>
              </div>
            </form>

            <section id="matching-products" className="scroll-mt-32 pt-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black text-cyan-700">
                    <Search className="h-4 w-4" />
                    نتیجه زنده جست‌وجو در همه محصولات
                  </div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {matchingProducts.length.toLocaleString("fa-IR")} محصول منطبق
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {discoveryCriteriaCount.toLocaleString("fa-IR")} معیار روی کاتالوگ اعمال شده است.
                  </p>
                </div>
                {matchingProducts.length > 12 && (
                  <Link
                    to={`/products?${productsQuery.toString()}`}
                    className="inline-flex items-center gap-2 text-sm font-black text-cyan-700 hover:text-cyan-900"
                  >
                    مشاهده همه نتایج
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {matchingProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {matchingProducts.slice(0, 12).map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/70 px-6 py-12 text-center">
                  <PackageSearch className="mx-auto h-12 w-12 text-amber-500" />
                  <h3 className="mt-4 text-xl font-black text-slate-900">محصول منطبقی موجود نیست</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600">
                    اگر مشخصات انتخاب‌شده نهایی است، مراحل ویزارد را کامل کنید تا درخواست دقیقاً با همین اطلاعات ثبت شود.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-slate-600">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof PackageSearch;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-black text-slate-400">{label}</div>
      <div className="mt-1 font-bold text-slate-800">{value}</div>
    </div>
  );
}
