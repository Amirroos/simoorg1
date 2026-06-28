import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Store,
  X,
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  Copy,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";

export function AdminSellers() {
  const { users, products, addUser, deleteUser, toggleSellerStatus } = useApp();
  const sellers = users.filter((u) => u.role === "seller");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ mobile: string; password: string } | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    location: "",
  });
  const [formError, setFormError] = useState("");

  const filtered = sellers.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.companyName?.toLowerCase().includes(q) &&
        !s.mobile.includes(q)
      )
        return false;
    }
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const resetForm = () => {
    setForm({ name: "", mobile: "", email: "", companyName: "", location: "" });
    setFormError("");
  };

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (form.name.length < 3) { setFormError("نام نماینده باید حداقل ۳ کاراکتر باشد"); return; }
    if (form.companyName.length < 3) { setFormError("نام شرکت/فروشگاه الزامی است"); return; }
    if (!/^09\d{9}$/.test(form.mobile)) { setFormError("شماره موبایل معتبر نیست"); return; }
    if (users.some((u) => u.mobile === form.mobile)) { setFormError("این شماره موبایل قبلاً ثبت شده است"); return; }

    const newUser = addUser({
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      companyName: form.companyName,
      location: form.location || "—",
      role: "seller",
      status: "active",
      rating: 5,
    });

    if (newUser) {
      setCreatedCredentials({ mobile: form.mobile, password: form.mobile });
      resetForm();
    }
  };

  const handleDelete = (id: string, name: string) => {
    const hasProducts = products.some((p) => p.sellerId === id);
    if (hasProducts) {
      if (!confirm(`این فروشنده محصولاتی دارد. آیا مطمئن هستید؟ "${name}"`)) return;
    } else {
      if (!confirm(`حذف فروشنده "${name}" را تأیید می‌کنید؟`)) return;
    }
    deleteUser(id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">تأمین‌کنندگان</h1>
          <p className="text-sm text-slate-500">
            مدیریت فروشندگان بازارگاه — {sellers.length.toLocaleString("fa-IR")} تأمین‌کننده
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          افزودن تأمین‌کننده
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام، شرکت یا موبایل..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="suspended">تعلیق</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const sellerProducts = products.filter((p) => p.sellerId === s.id || p.sellerName === s.companyName);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                    {s.companyName?.charAt(0) || s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 line-clamp-1">{s.companyName}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">نماینده: {s.name}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    s.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {s.status === "active" ? "فعال" : "تعلیق"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span dir="ltr">{s.mobile}</span>
                </div>
                {s.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-600" />
                    <span dir="ltr" className="truncate">{s.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                  {s.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <div className="text-lg font-black text-slate-800">{sellerProducts.length.toLocaleString("fa-IR")}</div>
                  <div className="text-[10px] text-slate-500">محصول فعال</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <div className="text-lg font-black text-slate-800 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {(s.rating || 5).toLocaleString("fa-IR")}
                  </div>
                  <div className="text-[10px] text-slate-500">امتیاز</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSellerStatus(s.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    s.status === "active"
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {s.status === "active" ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      تعلیق
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      فعال‌سازی
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.companyName || s.name)}
                  className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-20 text-center text-slate-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>تأمین‌کننده‌ای یافت نشد</p>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur flex items-center justify-center p-4"
            onClick={() => {
              if (!createdCredentials) setShowAddModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {createdCredentials ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">تأمین‌کننده اضافه شد!</h3>
                  <p className="text-sm text-slate-600 mb-5">
                    اطلاعات ورود را به فروشنده اطلاع دهید:
                  </p>
                  <div className="bg-gradient-to-bl from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-5 mb-5 text-right">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">آدرس ورود</div>
                        <div dir="ltr" className="font-mono bg-white px-3 py-2 rounded-lg text-sm text-slate-800 border border-slate-200">
                          /admin/login
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">نام کاربری (موبایل)</div>
                        <div className="flex gap-2">
                          <div dir="ltr" className="flex-1 font-mono bg-white px-3 py-2 rounded-lg text-sm text-slate-800 border border-slate-200">
                            {createdCredentials.mobile}
                          </div>
                          <button onClick={() => copyToClipboard(createdCredentials.mobile)} className="px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
                            <Copy className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">رمز عبور (موبایل)</div>
                        <div className="flex gap-2">
                          <div dir="ltr" className="flex-1 font-mono bg-white px-3 py-2 rounded-lg text-sm text-slate-800 border border-slate-200">
                            {createdCredentials.password}
                          </div>
                          <button onClick={() => copyToClipboard(createdCredentials.password)} className="px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
                            <Copy className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCreatedCredentials(null);
                      setShowAddModal(false);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold"
                  >
                    تأیید
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-cyan-600" />
                      <h3 className="font-bold text-lg">افزودن تأمین‌کننده جدید</h3>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddSeller} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        نام شرکت / فروشگاه <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder="مثلاً: تأمین قطعات خلیج"
                          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        نام نماینده <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="نام و نام خانوادگی"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          موبایل <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            value={form.mobile}
                            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                            placeholder="09171234567"
                            dir="ltr"
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm text-left"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">شهر</label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="بندرعباس"
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">ایمیل (اختیاری)</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="example@company.com"
                          dir="ltr"
                          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm text-left"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        اطلاعات ورود پنل فروشنده: نام کاربری و رمز هر دو برابر <strong>شماره موبایل</strong> خواهند بود.
                      </span>
                    </div>

                    {formError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-3 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition"
                      >
                        ایجاد حساب تأمین‌کننده
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
