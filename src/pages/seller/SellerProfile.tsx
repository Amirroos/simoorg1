import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Building2, Phone, Mail, MapPin, Star } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

export function SellerProfile() {
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({
    companyName: user?.companyName || "",
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    mobile: user?.mobile || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser(user.id, {
      companyName: form.companyName,
      name: form.name,
      email: form.email,
      location: form.location,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">پروفایل فروشگاه</h1>
        <p className="text-sm text-slate-500">اطلاعات فروشگاه شما در بازارگاه</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-bl from-purple-700 to-pink-800 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black">
            {user.companyName?.charAt(0) || user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black">{user.companyName}</h2>
            <p className="text-sm text-purple-200">{user.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{(user.rating || 5).toLocaleString("fa-IR")}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                user.status === "active" ? "bg-emerald-500/30 text-white" : "bg-rose-500/30 text-white"
              }`}>
                {user.status === "active" ? "فعال" : "تعلیق"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
        <h3 className="font-bold mb-2">ویرایش اطلاعات</h3>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Building2 className="w-4 h-4 inline ml-1" />
            نام فروشگاه / شرکت
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">نام نماینده</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <Phone className="w-4 h-4 inline ml-1" />
              موبایل
            </label>
            <input
              type="tel"
              value={form.mobile}
              disabled
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none text-sm text-left cursor-not-allowed"
            />
            <div className="text-[10px] text-slate-500 mt-1">شماره موبایل قابل تغییر نیست</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <Mail className="w-4 h-4 inline ml-1" />
              ایمیل
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm text-left"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <MapPin className="w-4 h-4 inline ml-1" />
              شهر
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
            />
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            تغییرات با موفقیت ذخیره شد
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-pink-700 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          ذخیره تغییرات
        </button>
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
        <div className="font-bold text-amber-800 mb-1">اطلاعات ورود به پنل</div>
        <p className="text-amber-700 text-xs leading-6">
          نام کاربری: <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">{user.mobile}</span> •
          رمز عبور: <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">{user.mobile}</span>
        </p>
      </div>
    </div>
  );
}
