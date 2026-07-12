import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
  FileSearch,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";

const menu = [
  { to: "/seller", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/seller/products", label: "محصولات من", icon: Package },
  { to: "/seller/admin-requests", label: "درخواست‌های ادمین", icon: ClipboardList },
  { to: "/seller/products/new", label: "افزودن محصول", icon: PlusCircle },
  { to: "/seller/rfqs", label: "مناقصات و استعلام‌ها", icon: FileSearch },
  { to: "/seller/orders", label: "سفارش‌ها", icon: ShoppingCart },
  { to: "/seller/profile", label: "پروفایل", icon: Settings },
];

export function SellerLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "seller") return null;

  const currentPage = menu.find((m) => (m.end ? loc.pathname === m.to : loc.pathname.startsWith(m.to)));

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-purple-900 via-slate-900 to-slate-950 text-white sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-base">پنل فروشنده</div>
              <div className="text-[10px] text-purple-300">سیمرغ تأمین دریا</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-l from-purple-600 to-pink-700 text-white shadow-lg shadow-purple-500/20"
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center font-bold">
              {(user.companyName || user.name).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{user.companyName}</div>
              <div className="text-[10px] text-purple-300">{user.name}</div>
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
            خروج
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/seller" className="text-slate-500 hover:text-purple-700">پنل فروشنده</Link>
              {currentPage && (
                <>
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-slate-800">{currentPage.label}</span>
                </>
              )}
            </div>
            <Link to="/" className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition">
              مشاهده سایت
            </Link>
          </div>

          {/* Mobile */}
          <div className="lg:hidden border-t border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        isActive ? "bg-purple-100 text-purple-700" : "text-slate-600"
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

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// خروجی دوم: انتخاب فروشنده‌ای محصولات
export function useSellerProducts() {
  const { user, products } = useApp();
  return products.filter((p) => {
    const belongsToSeller = p.sellerId === user?.id || p.sellerName === user?.companyName;
    if (!belongsToSeller) return false;
    return p.workflowType !== "admin_request_offer" || p.status === "published";
  });
}
