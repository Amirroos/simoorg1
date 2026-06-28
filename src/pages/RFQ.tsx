import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, CheckCircle2, Plus, X, Upload, Sparkles, Clock, Users, Target, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { categories, getDetailedSubcategoriesForProductGroup, productGroups, vesselTypes } from "../data/products";
import { useApp } from "../contexts/AppContext";

interface RFQItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  specs: string;
}

export function RFQ() {
  const { user, addRFQ, products } = useApp();
  const [params] = useSearchParams();
  const productId = params.get("productId") || "";
  const inquiryProduct = products.find((p) => p.id === productId && !p.hasPrice) || null;
  const requestType = inquiryProduct ? "product_price" : "missing_product";
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState(inquiryProduct ? `استعلام قیمت ${inquiryProduct.name}` : "");
  const [categoryId, setCategoryId] = useState(inquiryProduct?.categoryId || "");
  const [productGroupId, setProductGroupId] = useState(inquiryProduct?.productGroupId || "");
  const [subcategoryId, setSubcategoryId] = useState(inquiryProduct?.subcategoryId || "");
  const [vesselType, setVesselType] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [neededBy, setNeededBy] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<RFQItem[]>([
    {
      id: "1",
      name: inquiryProduct?.name || "",
      qty: 1,
      unit: "عدد",
      specs: inquiryProduct ? `${inquiryProduct.brand} ${inquiryProduct.model}`.trim() : "",
    },
  ]);

  useEffect(() => {
    if (!inquiryProduct) return;
    setTitle(`استعلام قیمت ${inquiryProduct.name}`);
    setCategoryId(inquiryProduct.categoryId);
    setProductGroupId(inquiryProduct.productGroupId || "");
    setSubcategoryId(inquiryProduct.subcategoryId || "");
    setItems([
      {
        id: "1",
        name: inquiryProduct.name,
        qty: 1,
        unit: "عدد",
        specs: `${inquiryProduct.brand} ${inquiryProduct.model}`.trim(),
      },
    ]);
  }, [inquiryProduct]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: "", qty: 1, unit: "عدد", specs: "" }]);
  };

  const currentSubcategories = productGroupId
    ? getDetailedSubcategoriesForProductGroup(productGroupId)
    : [];
  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id: string, field: keyof RFQItem, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const validate = () => {
    if (!user) return "برای ثبت درخواست ابتدا وارد حساب کاربری شوید.";
    if (user.role !== "buyer") return "ثبت درخواست فقط با حساب خریدار امکان‌پذیر است.";
    if (title.trim().length < 5) return "عنوان درخواست را کامل‌تر وارد کنید.";
    if (!categoryId) return "دسته کالا را انتخاب کنید.";
    if (!productGroupId) return "گروه محصول را انتخاب کنید.";
    if (!vesselType) return "نوع شناور را انتخاب کنید.";
    if (!neededBy) return "تاریخ نیاز را انتخاب کنید.";
    if (deliveryLocation.trim().length < 3) return "محل تحویل را وارد کنید.";
    if (description.trim().length < 5) return "توضیح کوتاهی درباره نیاز خود بنویسید.";
    if (items.some((i) => i.name.trim().length < 2)) return "نام همه اقلام درخواستی را وارد کنید.";
    if (items.some((i) => i.qty < 1)) return "تعداد اقلام باید حداقل یک باشد.";
    return "";
  };

  const canSubmit = Boolean(user && user.role === "buyer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const newRfq = addRFQ({
      requestType,
      productId: inquiryProduct?.id,
      productName: inquiryProduct?.name,
      productSellerId: inquiryProduct?.sellerId,
      productSellerName: inquiryProduct?.sellerName,
      title: title.trim(),
      categoryId,
      productGroupId,
      subcategoryId,
      vesselType,
      urgency,
      neededBy,
      deliveryLocation: deliveryLocation.trim(),
      description: description.trim(),
      items: items.map((item) => ({
        ...item,
        name: item.name.trim(),
        specs: item.specs.trim(),
      })),
    });
    if (!newRfq) {
      setError("درخواست ثبت نشد. لطفا با حساب خریدار وارد شوید و دوباره تلاش کنید.");
      return;
    }
    setSubmittedId(newRfq.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl p-8 text-center shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-cyan-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            درخواست استعلام شما ثبت شد!
          </h2>
          <p className="text-slate-600 mb-6">
            شماره RFQ: <span dir="ltr" className="font-bold text-cyan-700">{submittedId}</span>
          </p>
          <div className="space-y-3 text-right mb-6">
            {[
              { icon: Users, text: requestType === "product_price" ? "درخواست قیمت برای تامین‌کننده همین کالا ارسال شد" : "درخواست شما برای همه تامین‌کنندگان فعال ارسال شد" },
              { icon: Clock, text: "قیمت‌ها تا ۷ روز برای شما پنهان می‌مانند مگر اینکه ادمین زودتر منتشر کند" },
              { icon: Target, text: "بعد از انتشار، پایین‌ترین پیشنهاد برای شما برجسته می‌شود" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-100">
                <item.icon className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Link
              to="/my-rfqs"
              className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
            >
              پیگیری درخواست
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              بازگشت به خانه
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-cyan-200 text-xs font-semibold mb-3">
              <FileSearch className="w-4 h-4" />
              سیستم استعلام قیمت
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              درخواست استعلام (RFQ)
            </h1>
            <p className="text-slate-300 leading-7 max-w-2xl">
              قطعه نایاب یا تخصصی نیاز دارید؟ درخواست خود را ثبت کنید تا فروشندگان مرتبط
              بهترین پیشنهادها را برای شما ارسال کنند.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">ابتدا وارد حساب کاربری شوید</h3>
            <p className="text-slate-600 mb-5">
              برای ثبت درخواست استعلام، باید در بازارگاه ثبت‌نام کنید
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {inquiryProduct ? (
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-start gap-3">
                <FileSearch className="w-5 h-5 text-cyan-700 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-cyan-900 mb-1">استعلام قیمت کالای موجود در سامانه</div>
                  <p className="text-sm text-cyan-800 leading-7">
                    این درخواست برای کالای «{inquiryProduct.name}» ثبت می‌شود و با درخواست تامین کالای خارج از فهرست جداگانه مدیریت خواهد شد.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <FileSearch className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-amber-900 mb-1">درخواست تامین کالای خارج از فهرست</div>
                  <p className="text-sm text-amber-800 leading-7">
                    اگر کالا در سامانه پیدا نشده، مشخصات آن را ثبت کنید تا همه تامین‌کنندگان بتوانند پیشنهاد تامین بدهند.
                  </p>
                </div>
              </div>
            )}

            {/* Main info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                اطلاعات درخواست
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    عنوان درخواست <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثلاً: پمپ آب خنک‌کننده موتور دیزل ۲ عدد"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      دسته اصلی <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="">انتخاب کنید</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      گروه محصول <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={productGroupId}
                      onChange={(e) => {
                        setProductGroupId(e.target.value);
                        setSubcategoryId("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="">انتخاب کنید</option>
                      {productGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      زیر دسته تخصصی
                    </label>
                    <select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      disabled={!productGroupId || currentSubcategories.length === 0}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none disabled:opacity-50"
                    >
                      <option value="">انتخاب کنید</option>
                      {currentSubcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      نوع شناور <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={vesselType}
                      onChange={(e) => setVesselType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="">انتخاب کنید</option>
                      {vesselTypes.map((v) => (
                        <option key={v} value={v}>
                          ⚓ {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      فوریت
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="normal">عادی (تا یک هفته)</option>
                      <option value="urgent">فوری (تا ۳ روز)</option>
                      <option value="critical">بحرانی (کمتر از ۴۸ ساعت)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      تاریخ نیاز <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={neededBy}
                      onChange={(e) => setNeededBy(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    محل تحویل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="استان، شهر، اسکله یا بندر"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    توضیحات فنی <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="جزئیات فنی، برند مورد نظر، کاربرد، شرایط محیطی و..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none resize-none"
                  />
                  <div className="text-xs text-slate-500 mt-1 text-left">
                    {description.length}/5 حداقل کاراکتر
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  اقلام درخواست
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  <Plus className="w-4 h-4" />
                  افزودن قلم
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-600">قلم {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center disabled:opacity-30 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-[1fr_100px_120px] gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="نام کالا"
                        className="px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 1)}
                        placeholder="تعداد"
                        className="px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                      >
                        <option>عدد</option>
                        <option>ست</option>
                        <option>کیلوگرم</option>
                        <option>متر</option>
                        <option>بسته</option>
                      </select>
                    </div>
                    <textarea
                      value={item.specs}
                      onChange={(e) => updateItem(item.id, "specs", e.target.value)}
                      placeholder="مشخصات فنی این قلم..."
                      rows={2}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm resize-none"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Files upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-600" />
                فایل پیوست (اختیاری)
              </h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-400 transition">
                <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600 mb-1">
                  فایل‌های نقشه، عکس قطعه یا کاتالوگ را اینجا رها کنید
                </p>
                <p className="text-xs text-slate-400">حداکثر ۱۰ مگابایت، فرمت‌های JPG, PNG, PDF</p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 rounded-lg bg-slate-100 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  انتخاب فایل
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/products"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                بازگشت
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ارسال درخواست استعلام
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
