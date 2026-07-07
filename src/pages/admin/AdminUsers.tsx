import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  BadgeCheck,
  Calendar,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Trash2,
  User as UserIcon,
  Users,
  X,
  Search,
} from "lucide-react";
import { useApp, type User } from "../../contexts/AppContext";
import { formatPersianDate } from "../../utils/persianDate";

export function AdminUsers() {
  const { users, orders, rfqs, deleteUser } = useApp();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "buyer" | "seller" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const maritime = u.maritimeProfile;
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.mobile.includes(q) &&
        !u.email?.toLowerCase().includes(q) &&
        !u.companyName?.toLowerCase().includes(q) &&
        !maritime?.rank?.toLowerCase().includes(q) &&
        !maritime?.homePort?.toLowerCase().includes(q) &&
        !maritime?.vesselType?.toLowerCase().includes(q) &&
        !maritime?.vesselTypes?.some((type) => type.toLowerCase().includes(q))
      )
        return false;
    }
    if (filterRole !== "all" && u.role !== filterRole) return false;
    return true;
  });

  const userOrderCount = (uid: string) => orders.filter((o) => o.userId === uid).length;
  const userRfqCount = (uid: string) => rfqs.filter((rfq) => rfq.buyerId === uid).length;

  const roleLabel = (role: string) => {
    if (role === "admin") return { label: "ادمین", color: "bg-rose-50 text-rose-700" };
    if (role === "seller") return { label: "تأمین‌کننده", color: "bg-violet-50 text-violet-700" };
    return { label: "خریدار", color: "bg-cyan-50 text-cyan-700" };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">کاربران سامانه</h1>
          <p className="text-sm text-slate-500">
            {users.length.toLocaleString("fa-IR")} کاربر با پرونده هویتی و دریانوردی
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام، موبایل، بندر، رتبه یا نوع شناور..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="buyer">خریداران</option>
            <option value="seller">تأمین‌کنندگان</option>
            <option value="admin">ادمین‌ها</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "خریداران", count: users.filter((u) => u.role === "buyer").length, color: "from-cyan-500 to-blue-600", icon: Users },
          { label: "پروفایل دریانوردی", count: users.filter((u) => u.maritimeProfile).length, color: "from-emerald-500 to-teal-600", icon: Anchor },
          { label: "تأمین‌کنندگان", count: users.filter((u) => u.role === "seller").length, color: "from-violet-500 to-fuchsia-600", icon: Ship },
          { label: "ادمین‌ها", count: users.filter((u) => u.role === "admin").length, color: "from-rose-500 to-red-600", icon: ShieldCheck },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-slate-900">{s.count.toLocaleString("fa-IR")}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>کاربری یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">کاربر</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">تماس</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 hidden lg:table-cell">پرونده دریانوردی</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden md:table-cell">نقش</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden xl:table-cell">فعالیت</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u, i) => {
                  const role = roleLabel(u.role);
                  const maritime = u.maritimeProfile;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{u.name}</div>
                            <div className="text-xs text-slate-500 truncate">{u.companyName || u.city || u.location || "بدون موقعیت"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span dir="ltr">{u.mobile}</span>
                          </div>
                          {u.email && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span dir="ltr" className="truncate">{u.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {maritime ? (
                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <BadgeCheck className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{maritime.rank || "بدون رتبه"} • {maritime.vesselTypes?.join("، ") || maritime.vesselType || "بدون شناور"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{maritime.homePort || "بندر ثبت نشده"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">ثبت نشده</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${role.color}`}>
                          {u.role === "admin" && <ShieldCheck className="w-3 h-3" />}
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden xl:table-cell">
                        {u.role === "buyer" ? (
                          <div className="inline-flex items-center gap-3 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                              {userOrderCount(u.id).toLocaleString("fa-IR")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              {userRfqCount(u.id).toLocaleString("fa-IR")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatPersianDate(u.createdAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="w-8 h-8 rounded-lg hover:bg-cyan-50 text-cyan-700 inline-flex items-center justify-center transition"
                            title="مشاهده پروفایل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {u.role !== "admin" ? (
                            <button
                              onClick={() => {
                                if (confirm(`حذف کاربر "${u.name}" را تأیید می‌کنید؟`)) deleteUser(u.id);
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 inline-flex items-center justify-center transition"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} orderCount={userOrderCount(selectedUser.id)} rfqCount={userRfqCount(selectedUser.id)} />}
      </AnimatePresence>
    </div>
  );
}

function UserProfileModal({ user, orderCount, rfqCount, onClose }: { user: User; orderCount: number; rfqCount: number; onClose: () => void }) {
  const maritime = user.maritimeProfile;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 24, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative bg-slate-950 p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.35),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.2),transparent_28%)]" />
          <button onClick={onClose} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" title="بستن">
            <X className="w-5 h-5" />
          </button>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-black">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black">{user.name}</h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-300">
                <span dir="ltr">{user.mobile}</span>
                <span>•</span>
                <span>{user.companyName || user.city || user.location || "موقعیت ثبت نشده"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(90vh-132px)] overflow-y-auto p-5 space-y-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <SummaryCard icon={ShoppingBag} label="سفارش‌ها" value={orderCount.toLocaleString("fa-IR")} />
            <SummaryCard icon={FileText} label="استعلام‌ها" value={rfqCount.toLocaleString("fa-IR")} />
            <SummaryCard icon={Anchor} label="مدارک" value={(maritime?.attachmentNames?.length || 0).toLocaleString("fa-IR")} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <DetailPanel title="اطلاعات هویتی" icon={UserIcon}>
              <Info label="نام" value={user.name} />
              <Info label="موبایل" value={user.mobile} ltr />
              <Info label="ایمیل" value={user.email || "ثبت نشده"} ltr />
              <Info label="کد ملی" value={user.nationalId || "ثبت نشده"} ltr />
              <Info label="تاریخ تولد" value={formatPersianDate(user.birthDate)} />
              <Info label="شهر" value={user.city || user.location || "ثبت نشده"} />
              <Info label="آدرس" value={user.address || "ثبت نشده"} />
            </DetailPanel>

            <DetailPanel title="پرونده دریانوردی" icon={Ship}>
              <Info label="رتبه / نقش" value={maritime?.rank || "ثبت نشده"} />
              <Info label="کد دریانوردی" value={maritime?.seafarerCode || "ثبت نشده"} ltr />
              <Info label="نوع شناور" value={maritime?.vesselTypes?.join("، ") || maritime?.vesselType || "ثبت نشده"} />
              <Info label="نام شناور" value={maritime?.vesselName || "ثبت نشده"} />
              <Info label="IMO / شماره ثبت" value={maritime?.vesselImo || "ثبت نشده"} ltr />
              <Info label="بندر فعالیت" value={maritime?.homePort || "ثبت نشده"} />
              <Info label="شرکت / سازمان" value={maritime?.organization || "ثبت نشده"} />
              <Info label="سابقه" value={maritime?.yearsExperience || "ثبت نشده"} />
            </DetailPanel>
          </div>

          <DetailPanel title="گواهینامه‌ها، تخصص‌ها و فایل‌ها" icon={BadgeCheck}>
            <div className="grid lg:grid-cols-3 gap-4">
              <TagGroup title="گواهینامه‌ها" items={maritime?.certificates || []} />
              <TagGroup title="تخصص‌ها" items={maritime?.specialties || []} />
              <TagGroup title="نام فایل‌های مدارک" items={maritime?.attachmentNames || []} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Info label="شماره گواهینامه" value={maritime?.licenseNumber || "ثبت نشده"} ltr />
              <Info label="اعتبار گواهینامه" value={formatPersianDate(maritime?.licenseExpiresAt)} />
              <Info label="تماس اضطراری" value={maritime?.emergencyContact || "ثبت نشده"} />
              <Info label="موبایل اضطراری" value={maritime?.emergencyMobile || "ثبت نشده"} ltr />
            </div>
            {maritime?.notes && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {maritime.notes}
              </div>
            )}
          </DetailPanel>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof ShoppingBag; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <Icon className="w-5 h-5 text-cyan-700 mb-3" />
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function DetailPanel({ title, icon: Icon, children }: { title: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-200 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-black text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span dir={ltr ? "ltr" : "rtl"} className="font-bold text-slate-800 text-left break-words">
        {value}
      </span>
    </div>
  );
}

function TagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-black text-slate-500 mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
              {item}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">ثبت نشده</span>
        )}
      </div>
    </div>
  );
}
