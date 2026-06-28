import { Settings, Database, ShieldCheck, Bell, Globe, AlertCircle } from "lucide-react";

export function AdminSettings() {
  const handleClearData = () => {
    if (confirm("⚠️ تمام داده‌های سیستم پاک می‌شود! آیا مطمئن هستید؟")) {
      if (confirm("این عملیات قابل بازگشت نیست. تأیید نهایی؟")) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-cyan-600" />
          تنظیمات سیستم
        </h1>
        <p className="text-sm text-slate-500">مدیریت پیکربندی کلی بازارگاه</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            امنیت و دسترسی
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>نیاز به تأیید دو مرحله‌ای برای ادمین</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>قفل خودکار سشن پس از ۳۰ دقیقه</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>ثبت لاگ همه عملیات حساس</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            اعلان‌ها
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>ارسال پیامک سفارش به مشتری</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>هشدار اتمام موجودی به فروشنده</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
              <span>ایمیل فاکتور به مشتری</span>
              <input type="checkbox" defaultChecked className="accent-cyan-600 w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-600" />
            پارامترهای بازارگاه
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-slate-600 mb-1">نرخ کارمزد بازارگاه (%)</label>
              <input type="number" defaultValue="3" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">مهلت پاسخ RFQ (روز)</label>
              <input type="number" defaultValue="3" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">نرخ مالیات (%)</label>
              <input type="number" defaultValue="9" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-rose-700">
            <Database className="w-5 h-5" />
            ناحیه خطر
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>عملیات این بخش غیرقابل بازگشت هستند. با احتیاط استفاده کنید.</span>
            </div>
            <button
              onClick={handleClearData}
              className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-sm transition border border-rose-200"
            >
              پاک کردن همه داده‌های سیستم
            </button>
            <p className="text-xs text-slate-500">
              تمام کاربران، محصولات، سفارش‌ها و تنظیمات به حالت اولیه باز خواهد گشت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
