import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Anchor,
  Bell,
  ChevronLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";

import { FileSearch } from "lucide-react";

type AdminMenuChild = { to: string; label: string; end?: boolean };
type AdminMenuItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  children?: AdminMenuChild[];
};

const menu: AdminMenuItem[] = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  {
    to: "/admin/products",
    label: "محصولات",
    icon: Package,
    children: [
      { to: "/admin/products", label: "محصولات انتشار یافته", end: true },
      { to: "/admin/products/requests", label: "محصولات درخواستی" },
      { to: "/admin/products/suppliers", label: "محصولات تامین کننده" },
    ],
  },
  { to: "/admin/sellers", label: "تأمین‌کنندگان", icon: Store },
  { to: "/admin/users", label: "کاربران", icon: Users },
  { to: "/admin/orders", label: "سفارش‌ها", icon: ShoppingCart },
  { to: "/admin/rfqs", label: "مناقصات و استعلام‌ها", icon: FileSearch },
  { to: "/admin/reports", label: "گزارش‌ها", icon: BarChart3 },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const currentPage = menu
    .flatMap((item) => item.children ?? [item])
    .find((item) => (item.end ? loc.pathname === item.to : loc.pathname.startsWith(item.to)));

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-base">سیمرغ تأمین دریا</div>
              <div className="text-[10px] text-cyan-300">پنل مدیریت</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              const isOpen = loc.pathname.startsWith(item.to);
              return (
                <div key={item.to} className="space-y-1">
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isOpen
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} />
                  </Link>
                  {isOpen && (
                    <div className="pr-8 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={child.end}
                          className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg text-xs font-bold transition ${
                              isActive
                                ? "bg-gradient-to-l from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-l from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{user.name}</div>
              <div className="text-[10px] text-cyan-300">ادمین کل</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            خروج از پنل
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/admin" className="text-slate-500 hover:text-cyan-700">پنل مدیریت</Link>
              {currentPage && (
                <>
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-slate-800">{currentPage.label}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                مشاهده سایت
              </Link>
              <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden border-t border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              {menu.map((item) => {
                const Icon = item.icon;
                if (item.children) {
                  return item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                          isActive ? "bg-cyan-100 text-cyan-700" : "text-slate-600"
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {child.label}
                    </NavLink>
                  ));
                }
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        isActive ? "bg-cyan-100 text-cyan-700" : "text-slate-600"
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">{children || <Outlet />}</div>
      </div>
    </div>
  );
}
