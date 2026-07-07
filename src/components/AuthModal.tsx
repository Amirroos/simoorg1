import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  User as UserIcon,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Anchor,
  BadgeCheck,
  CalendarDays,
  FileUp,
  MapPin,
  Ship,
  BriefcaseBusiness,
  Phone,
} from "lucide-react";
import { useApp, type MaritimeProfile } from "../contexts/AppContext";
import { PersianDateInput } from "./PersianDateInput";
import { MultiSelect, SingleSelect } from "./SmartSelect";
import { vesselTypes } from "../data/products";
import { seafarerRanks } from "../data/maritime";
import { isPersianDate } from "../utils/persianDate";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
}

const certificateOptions = ["STCW", "Basic Safety", "Watchkeeping", "GMDSS", "Medical First Aid", "Tanker Familiarization"];
const specialtyOptions = ["موتورخانه", "عرشه", "برق و الکترونیک", "ناوبری", "ایمنی", "تدارکات شناور"];

export function AuthModal({ open, onClose, onLoggedIn }: AuthModalProps) {
  const { login } = useApp();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [step, setStep] = useState<"form" | "success">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    nationalId: "",
    birthDate: "",
    city: "",
    address: "",
    rank: "",
    seafarerCode: "",
    vesselType: "",
    vesselName: "",
    vesselImo: "",
    homePort: "",
    organization: "",
    yearsExperience: "",
    licenseNumber: "",
    licenseExpiresAt: "",
    emergencyContact: "",
    emergencyMobile: "",
    notes: "",
  });
  const [certificates, setCertificates] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const reset = () => {
    setStep("form");
    setError("");
    setLoading(false);
    setForm({
      name: "",
      mobile: "",
      email: "",
      nationalId: "",
      birthDate: "",
      city: "",
      address: "",
      rank: "",
      seafarerCode: "",
      vesselType: "",
      vesselName: "",
      vesselImo: "",
      homePort: "",
      organization: "",
      yearsExperience: "",
      licenseNumber: "",
      licenseExpiresAt: "",
      emergencyContact: "",
      emergencyMobile: "",
      notes: "",
    });
    setCertificates([]);
    setSpecialties([]);
    setSelectedVesselTypes([]);
    setAttachmentNames([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateRegister = () => {
    if (form.name.trim().length < 3) return "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد";
    if (!/^09\d{9}$/.test(form.mobile)) return "شماره موبایل باید ۱۱ رقم و با 09 شروع شود";
    if (form.nationalId && !/^\d{10}$/.test(form.nationalId)) return "کد ملی باید ۱۰ رقم باشد";
    if (form.birthDate && !isPersianDate(form.birthDate)) return "تاریخ تولد را به‌صورت شمسی ۱۴۰۵/۰۴/۱۷ وارد کنید";
    if (!form.rank.trim()) return "رتبه یا نقش دریانوردی را انتخاب کنید";
    if (!form.homePort.trim()) return "بندر فعالیت یا بندر مبدأ را وارد کنید";
    if (selectedVesselTypes.length === 0) return "حداقل یک نوع شناور را انتخاب کنید";
    if (form.licenseExpiresAt && !isPersianDate(form.licenseExpiresAt)) return "اعتبار گواهینامه را به‌صورت شمسی ۱۴۰۵/۰۴/۱۷ وارد کنید";
    if (form.emergencyMobile && !/^09\d{9}$/.test(form.emergencyMobile)) return "شماره تماس اضطراری معتبر نیست";
    return "";
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!/^09\d{9}$/.test(form.mobile)) {
        setError("شماره موبایل باید ۱۱ رقم و با 09 شروع شود");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const ok = login(form.mobile, "کاربر " + form.mobile.slice(-4), "buyer");
        setLoading(false);
        if (ok) {
          setStep("success");
          setTimeout(() => {
            reset();
            onClose();
            onLoggedIn?.();
          }, 1000);
        } else {
          setError("خطا در ورود. لطفاً دوباره تلاش کنید.");
        }
      }, 500);
      return;
    }

    const validationError = validateRegister();
    if (validationError) {
      setError(validationError);
      return;
    }

    const maritimeProfile: MaritimeProfile = {
      rank: form.rank.trim(),
      seafarerCode: form.seafarerCode.trim(),
      vesselType: selectedVesselTypes.join("، "),
      vesselTypes: selectedVesselTypes,
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

    setLoading(true);
    setTimeout(() => {
      const ok = login(form.mobile, form.name.trim(), "buyer", {
        email: form.email.trim(),
        nationalId: form.nationalId.trim(),
        birthDate: form.birthDate,
        city: form.city.trim(),
        address: form.address.trim(),
        maritimeProfile,
      });
      setLoading(false);
      if (ok) {
        setStep("success");
        setTimeout(() => {
          reset();
          onClose();
          onLoggedIn?.();
        }, 1200);
      } else {
        setError("خطا در ثبت‌نام. لطفاً اطلاعات را بررسی کنید.");
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.35),transparent_34%),radial-gradient(circle_at_75%_5%,rgba(245,158,11,0.22),transparent_30%)]" />
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative grid md:grid-cols-[0.9fr_1.4fr] gap-5 px-6 py-6 sm:px-8">
                <div className="text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100 mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    احراز هویت و پروفایل دریانوردی
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black leading-10">
                    {step === "success" ? "پروفایل شما آماده شد" : mode === "login" ? "ورود به حساب" : "ثبت‌نام کامل دریانوردی"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    اطلاعات هویتی، شناوری، گواهینامه‌ها و فایل‌های مدارک در پروفایل ذخیره می‌شوند و در پنل مدیریت قابل مشاهده هستند.
                  </p>
                </div>
                <div className="hidden md:grid grid-cols-3 gap-3 text-white">
                  {[
                    { icon: Anchor, label: "رتبه", value: form.rank || "دریانورد" },
                    { icon: Ship, label: "شناور", value: selectedVesselTypes[0] || "تجاری" },
                    { icon: FileUp, label: "مدارک", value: `${attachmentNames.length.toLocaleString("fa-IR")} فایل` },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                        <Icon className="w-5 h-5 text-cyan-200 mb-4" />
                        <div className="text-[11px] text-slate-300">{item.label}</div>
                        <div className="font-black truncate">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-5 sm:p-6">
              {step === "form" && (
                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div className="flex gap-2 p-1 rounded-2xl bg-slate-100">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                        mode === "login" ? "bg-white text-cyan-700 shadow" : "text-slate-500"
                      }`}
                    >
                      ورود
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                        mode === "register" ? "bg-white text-cyan-700 shadow" : "text-slate-500"
                      }`}
                    >
                      ثبت‌نام کامل
                    </button>
                  </div>

                  {mode === "register" && (
                    <>
                      <SectionTitle icon={UserIcon} title="اطلاعات هویتی" />
                      <div className="grid md:grid-cols-3 gap-3">
                        <Field label="نام و نام خانوادگی" icon={UserIcon} required>
                          <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="مثلاً: علی محمدی" className="input-shell" />
                        </Field>
                        <Field label="کد ملی">
                          <input value={form.nationalId} onChange={(e) => updateField("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))} dir="ltr" placeholder="0012345678" className="input-shell text-left" />
                        </Field>
                        <Field label="تاریخ تولد" icon={CalendarDays}>
                          <PersianDateInput value={form.birthDate} onChange={(value) => updateField("birthDate", value)} />
                        </Field>
                        <Field label="ایمیل">
                          <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} dir="ltr" placeholder="name@example.com" className="input-shell text-left" />
                        </Field>
                        <Field label="شهر" icon={MapPin}>
                          <input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="بندرعباس" className="input-shell" />
                        </Field>
                        <Field label="موبایل" icon={Smartphone} required>
                          <input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, "").slice(0, 11))} dir="ltr" placeholder="09123456789" className="input-shell text-left" />
                        </Field>
                      </div>
                      <Field label="آدرس">
                        <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} rows={2} placeholder="آدرس محل فعالیت یا سکونت" className="input-shell resize-none" />
                      </Field>

                      <SectionTitle icon={Anchor} title="اطلاعات دریانوردی و شناور" />
                      <div className="grid md:grid-cols-3 gap-3">
                        <Field label="رتبه / نقش دریانوردی" icon={BadgeCheck} required>
                          <SingleSelect value={form.rank} onChange={(value) => updateField("rank", value)} options={seafarerRanks} />
                        </Field>
                        <Field label="کد دریانوردی">
                          <input value={form.seafarerCode} onChange={(e) => updateField("seafarerCode", e.target.value)} dir="ltr" placeholder="SEA-1024" className="input-shell text-left" />
                        </Field>
                        <Field label="سابقه کار">
                          <input value={form.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} placeholder="مثلاً ۸ سال" className="input-shell" />
                        </Field>
                        <Field label="نوع شناور" icon={Ship} required>
                          <MultiSelect values={selectedVesselTypes} onChange={setSelectedVesselTypes} options={vesselTypes} />
                        </Field>
                        <Field label="نام شناور">
                          <input value={form.vesselName} onChange={(e) => updateField("vesselName", e.target.value)} placeholder="نام شناور" className="input-shell" />
                        </Field>
                        <Field label="IMO / شماره ثبت">
                          <input value={form.vesselImo} onChange={(e) => updateField("vesselImo", e.target.value)} dir="ltr" placeholder="IMO 1234567" className="input-shell text-left" />
                        </Field>
                        <Field label="بندر فعالیت" icon={MapPin} required>
                          <input value={form.homePort} onChange={(e) => updateField("homePort", e.target.value)} placeholder="بندرعباس، بوشهر..." className="input-shell" />
                        </Field>
                        <Field label="شرکت / سازمان" icon={BriefcaseBusiness}>
                          <input value={form.organization} onChange={(e) => updateField("organization", e.target.value)} placeholder="نام شرکت کشتیرانی" className="input-shell" />
                        </Field>
                        <Field label="شماره گواهینامه">
                          <input value={form.licenseNumber} onChange={(e) => updateField("licenseNumber", e.target.value)} dir="ltr" className="input-shell text-left" />
                        </Field>
                        <Field label="اعتبار گواهینامه" icon={CalendarDays}>
                          <PersianDateInput value={form.licenseExpiresAt} onChange={(value) => updateField("licenseExpiresAt", value)} />
                        </Field>
                      </div>

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

                      <SectionTitle icon={Phone} title="تماس اضطراری و مدارک" />
                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="نام تماس اضطراری">
                          <input value={form.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} placeholder="نام شخص معتمد" className="input-shell" />
                        </Field>
                        <Field label="موبایل اضطراری">
                          <input value={form.emergencyMobile} onChange={(e) => updateField("emergencyMobile", e.target.value.replace(/\D/g, "").slice(0, 11))} dir="ltr" placeholder="09123456789" className="input-shell text-left" />
                        </Field>
                      </div>
                      <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-4">
                        <label className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer">
                          <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
                            <FileUp className="w-6 h-6" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-black text-slate-800">انتخاب فایل مدارک</span>
                            <span className="block text-xs leading-6 text-slate-500">کارت دریانوردی، گواهینامه‌ها، معرفی‌نامه یا هر مدرک مرتبط. نام فایل‌ها در پروفایل ذخیره می‌شود.</span>
                          </span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => setAttachmentNames(Array.from(e.target.files || []).map((file) => file.name))}
                          />
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
                      <Field label="توضیحات تکمیلی">
                        <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} placeholder="نیازهای خرید، مسیرهای فعالیت، نوع قطعات موردنیاز..." className="input-shell resize-none" />
                      </Field>
                    </>
                  )}

                  {mode === "login" && (
                    <div className="max-w-md mx-auto py-4">
                      <Field label="شماره موبایل" icon={Smartphone} required>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, "").slice(0, 11))}
                          placeholder="09123456789"
                          dir="ltr"
                          className="input-shell text-left"
                        />
                      </Field>
                    </div>
                  )}

                  {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-cyan-600 via-blue-700 to-slate-900 text-white font-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        در حال ثبت اطلاعات...
                      </>
                    ) : mode === "login" ? (
                      "ورود به حساب"
                    ) : (
                      "ثبت‌نام و ساخت پروفایل کامل"
                    )}
                  </button>
                </form>
              )}

              {step === "success" && (
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">ورود موفق!</h4>
                  <p className="text-sm text-slate-600">پروفایل دریانوردی شما در سامانه ثبت شد.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof UserIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-200 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="font-black text-slate-900">{title}</h4>
    </div>
  );
}

function Field({ label, icon: Icon, required, children }: { label: string; icon?: typeof UserIcon; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-1.5">
        {Icon && <Icon className="w-4 h-4 text-cyan-700" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function ChoicePanel({ title, children }: { title: string; children: React.ReactNode }) {
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
