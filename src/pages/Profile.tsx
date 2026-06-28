import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  FileUp,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Ship,
  User as UserIcon,
  Waves,
} from "lucide-react";
import { useApp, type MaritimeProfile } from "../contexts/AppContext";

const certificateOptions = ["STCW", "Basic Safety", "Watchkeeping", "GMDSS", "Medical First Aid", "Tanker Familiarization"];
const specialtyOptions = ["موتورخانه", "عرشه", "برق و الکترونیک", "ناوبری", "ایمنی", "تدارکات شناور"];

export function Profile() {
  const { user, updateUser, orders, rfqs } = useApp();
  const maritime = user?.maritimeProfile || {};
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
    nationalId: user?.nationalId || "",
    birthDate: user?.birthDate || "",
    city: user?.city || "",
    address: user?.address || "",
    rank: maritime.rank || "",
    seafarerCode: maritime.seafarerCode || "",
    vesselType: maritime.vesselType || "",
    vesselName: maritime.vesselName || "",
    vesselImo: maritime.vesselImo || "",
    homePort: maritime.homePort || "",
    organization: maritime.organization || "",
    yearsExperience: maritime.yearsExperience || "",
    licenseNumber: maritime.licenseNumber || "",
    licenseExpiresAt: maritime.licenseExpiresAt || "",
    emergencyContact: maritime.emergencyContact || "",
    emergencyMobile: maritime.emergencyMobile || "",
    notes: maritime.notes || "",
  });
  const [certificates, setCertificates] = useState<string[]>(maritime.certificates || []);
  const [specialties, setSpecialties] = useState<string[]>(maritime.specialties || []);
  const [attachmentNames, setAttachmentNames] = useState<string[]>(maritime.attachmentNames || []);

  const userOrders = user ? orders.filter((order) => order.userId === user.id) : [];
  const userRfqs = user ? rfqs.filter((rfq) => rfq.buyerId === user.id) : [];

  const completion = useMemo(() => {
    const values = [
      form.name,
      form.mobile,
      form.nationalId,
      form.city,
      form.rank,
      form.vesselType,
      form.homePort,
      form.licenseNumber,
      certificates.length ? "certs" : "",
      specialties.length ? "skills" : "",
      attachmentNames.length ? "files" : "",
    ];
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [attachmentNames.length, certificates.length, form, specialties.length]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyan-50 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-cyan-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">برای مشاهده پروفایل وارد شوید</h1>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
            className="mt-4 px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 transition"
          >
            ورود / ثبت‌نام
          </button>
        </div>
      </div>
    );
  }

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const toggleArrayValue = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const maritimeProfile: MaritimeProfile = {
      rank: form.rank.trim(),
      seafarerCode: form.seafarerCode.trim(),
      vesselType: form.vesselType.trim(),
      vesselName: form.vesselName.trim(),
      vesselImo: form.vesselImo.trim(),
      homePort: form.homePort.trim(),
      organization: form.organization.trim(),
      yearsExperience: form.yearsExperience.trim(),
      licenseNumber: form.licenseNumber.trim(),
      licenseExpiresAt: form.licenseExpiresAt,
      certificates,
      specialties,
      emergencyContact: form.emergencyContact.trim(),
      emergencyMobile: form.emergencyMobile.trim(),
      attachmentNames,
      notes: form.notes.trim(),
    };
    updateUser(user.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      nationalId: form.nationalId.trim(),
      birthDate: form.birthDate,
      city: form.city.trim(),
      address: form.address.trim(),
      maritimeProfile,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(6,182,212,0.32),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(245,158,11,0.18),transparent_30%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-stretch">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100 mb-4">
                <Waves className="w-4 h-4" />
                پروفایل فعال سامانه
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-12">{user.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                کارت هویتی، سوابق دریانوردی، گواهینامه‌ها و فایل‌های مدرک شما اینجا نگهداری می‌شود و در پنل مدیریت قابل بررسی است.
              </p>
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <Stat icon={Ship} label="نوع شناور" value={maritime.vesselType || "ثبت نشده"} />
                <Stat icon={Anchor} label="رتبه دریانوردی" value={maritime.rank || "ثبت نشده"} />
                <Stat icon={MapPin} label="بندر فعالیت" value={maritime.homePort || "ثبت نشده"} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">تکمیل پروفایل</div>
                  <div className="text-4xl font-black mt-1" dir="ltr">{completion}%</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-cyan-200" />
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-l from-amber-300 to-cyan-300" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="سفارش" value={userOrders.length} />
                <MiniStat label="استعلام" value={userRfqs.length} />
                <MiniStat label="فایل" value={attachmentNames.length} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="grid xl:grid-cols-[1fr_340px] gap-5">
          <div className="space-y-5">
            <Panel title="اطلاعات هویتی" icon={UserIcon}>
              <div className="grid md:grid-cols-3 gap-3">
                <Field label="نام و نام خانوادگی">
                  <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="input-shell" />
                </Field>
                <Field label="موبایل">
                  <input value={form.mobile} disabled dir="ltr" className="input-shell text-left bg-slate-50 text-slate-500 cursor-not-allowed" />
                </Field>
                <Field label="کد ملی">
                  <input value={form.nationalId} onChange={(e) => updateField("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))} dir="ltr" className="input-shell text-left" />
                </Field>
                <Field label="ایمیل">
                  <input value={form.email} onChange={(e) => updateField("email", e.target.value)} dir="ltr" className="input-shell text-left" />
                </Field>
                <Field label="تاریخ تولد">
                  <input type="date" value={form.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} className="input-shell text-left" />
                </Field>
                <Field label="شهر">
                  <input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="input-shell" />
                </Field>
              </div>
              <Field label="آدرس">
                <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} rows={2} className="input-shell resize-none" />
              </Field>
            </Panel>

            <Panel title="اطلاعات دریانوردی" icon={Anchor}>
              <div className="grid md:grid-cols-3 gap-3">
                <Field label="رتبه / نقش">
                  <input value={form.rank} onChange={(e) => updateField("rank", e.target.value)} className="input-shell" />
                </Field>
                <Field label="کد دریانوردی">
                  <input value={form.seafarerCode} onChange={(e) => updateField("seafarerCode", e.target.value)} dir="ltr" className="input-shell text-left" />
                </Field>
                <Field label="سابقه کار">
                  <input value={form.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} className="input-shell" />
                </Field>
                <Field label="نوع شناور">
                  <input value={form.vesselType} onChange={(e) => updateField("vesselType", e.target.value)} className="input-shell" />
                </Field>
                <Field label="نام شناور">
                  <input value={form.vesselName} onChange={(e) => updateField("vesselName", e.target.value)} className="input-shell" />
                </Field>
                <Field label="IMO / شماره ثبت">
                  <input value={form.vesselImo} onChange={(e) => updateField("vesselImo", e.target.value)} dir="ltr" className="input-shell text-left" />
                </Field>
                <Field label="بندر فعالیت">
                  <input value={form.homePort} onChange={(e) => updateField("homePort", e.target.value)} className="input-shell" />
                </Field>
                <Field label="شرکت / سازمان">
                  <input value={form.organization} onChange={(e) => updateField("organization", e.target.value)} className="input-shell" />
                </Field>
                <Field label="شماره گواهینامه">
                  <input value={form.licenseNumber} onChange={(e) => updateField("licenseNumber", e.target.value)} dir="ltr" className="input-shell text-left" />
                </Field>
                <Field label="اعتبار گواهینامه">
                  <input type="date" value={form.licenseExpiresAt} onChange={(e) => updateField("licenseExpiresAt", e.target.value)} className="input-shell text-left" />
                </Field>
              </div>
            </Panel>

            <Panel title="مهارت‌ها و مدارک" icon={BadgeCheck}>
              <div className="grid lg:grid-cols-2 gap-4">
                <ChoicePanel title="گواهینامه‌ها">
                  {certificateOptions.map((item) => (
                    <ChoicePill key={item} label={item} active={certificates.includes(item)} onClick={() => toggleArrayValue(item, certificates, setCertificates)} />
                  ))}
                </ChoicePanel>
                <ChoicePanel title="تخصص‌ها">
                  {specialtyOptions.map((item) => (
                    <ChoicePill key={item} label={item} active={specialties.includes(item)} onClick={() => toggleArrayValue(item, specialties, setSpecialties)} />
                  ))}
                </ChoicePanel>
              </div>
              <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/70 p-4">
                <label className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer">
                  <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
                    <FileUp className="w-6 h-6" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-black text-slate-800">به‌روزرسانی فایل‌های مدارک</span>
                    <span className="block text-xs leading-6 text-slate-500">نام فایل‌های انتخاب‌شده در پروفایل ثبت می‌شود.</span>
                  </span>
                  <input type="file" multiple className="hidden" onChange={(e) => setAttachmentNames(Array.from(e.target.files || []).map((file) => file.name))} />
                </label>
                {attachmentNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachmentNames.map((name) => (
                      <span key={name} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 border border-cyan-100">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel title="خلاصه پرونده" icon={FileText}>
              <div className="space-y-3">
                <InfoLine label="رتبه" value={form.rank || "ثبت نشده"} />
                <InfoLine label="کد دریانوردی" value={form.seafarerCode || "ثبت نشده"} ltr />
                <InfoLine label="بندر" value={form.homePort || "ثبت نشده"} />
                <InfoLine label="شناور" value={form.vesselName || form.vesselType || "ثبت نشده"} />
                <InfoLine label="اعتبار گواهینامه" value={form.licenseExpiresAt ? new Date(form.licenseExpiresAt).toLocaleDateString("fa-IR") : "ثبت نشده"} />
              </div>
            </Panel>

            <Panel title="تماس اضطراری" icon={Phone}>
              <div className="space-y-3">
                <Field label="نام">
                  <input value={form.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} className="input-shell" />
                </Field>
                <Field label="موبایل">
                  <input value={form.emergencyMobile} onChange={(e) => updateField("emergencyMobile", e.target.value.replace(/\D/g, "").slice(0, 11))} dir="ltr" className="input-shell text-left" />
                </Field>
              </div>
            </Panel>

            <Panel title="یادداشت" icon={BriefcaseBusiness}>
              <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} className="input-shell resize-none" placeholder="نیازهای خرید، مسیر فعالیت، توضیحات..." />
            </Panel>

            {saved && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                تغییرات پروفایل ذخیره شد
              </div>
            )}

            <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-cyan-600 to-blue-800 text-white font-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              ذخیره پروفایل
            </button>
            <Link to="/orders" className="block text-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">
              مشاهده سفارش‌ها
            </Link>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="w-5 h-5 text-cyan-200 mb-3" />
      <div className="text-[11px] text-slate-300">{label}</div>
      <div className="font-black truncate">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="text-xl font-black">{value.toLocaleString("fa-IR")}</div>
      <div className="text-[11px] text-slate-300">{label}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-200 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function InfoLine({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span dir={ltr ? "ltr" : "rtl"} className="font-bold text-slate-800 truncate">{value}</span>
    </div>
  );
}

function ChoicePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-sm font-black text-slate-800 mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ChoicePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
        active ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-cyan-300"
      }`}
    >
      {label}
    </button>
  );
}
