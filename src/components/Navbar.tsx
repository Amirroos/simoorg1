import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Heart,
  Package,
  Search,
  Shield,
  Store,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../contexts/AppContext";

interface NavbarProps {
  onOpenAuth: () => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const { user, logout, cart, favorites } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [panelMenu, setPanelMenu] = useState(false);
  const loc = useLocation();
  const seafarerRank = user?.maritimeProfile?.rank?.trim();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "";
  const greetingTitle = seafarerRank || (user?.role === "seller" ? "تأمین‌کننده" : user?.role === "admin" ? "مدیر" : "دریانورد");

  const navLinks = [
    { to: "/", label: "خانه" },
    { to: "/products", label: "محصولات" },
    { to: "/categories", label: "گروه محصول" },
    { to: "/rfq", label: "ثبت استعلام (RFQ)" },
  ];

  if (user && user.role === "buyer") {
    navLinks.push({ to: "/profile", label: "پروفایل" });
    navLinks.push({ to: "/my-rfqs", label: "استعلام‌های من" });
    navLinks.push({ to: "/orders", label: "سفارش‌های من" });
  }

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Top utility strip */}
      <div className="bg-slate-950 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              سامانه آنلاین
            </span>
            <span className="hidden md:inline opacity-60">|</span>
            <span className="hidden md:inline">
              پشتیبانی: <span dir="ltr" className="font-mono">076-3355-8800</span>
            </span>
          </div>

          {/* Quick panel access */}
          <div className="relative mr-auto sm:mr-0">
            <button
              onClick={() => setPanelMenu((v) => !v)}
              onBlur={() => setTimeout(() => setPanelMenu(false), 200)}
              className="flex items-center gap-1.5 px-3 h-9 hover:bg-white/5 transition text-cyan-300 font-semibold"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ورود به پنل‌ها</span>
              <ChevronDown className={`w-3 h-3 transition ${panelMenu ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {panelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-50"
                >
                  <Link
                    to="/admin/login"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setPanelMenu(false)}
                    className="flex items-start gap-3 p-4 hover:bg-cyan-50 transition group border-b border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">پنل مدیریت</div>
                      <div className="text-[11px] text-slate-500 leading-5">
                        دسترسی برای ادمین کل سامانه
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/admin/login"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setPanelMenu(false)}
                    className="flex items-start gap-3 p-4 hover:bg-purple-50 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">پنل تأمین‌کننده</div>
                      <div className="text-[11px] text-slate-500 leading-5">
                        مدیریت محصولات و سفارش‌های فروشگاه
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-12 h-12 rounded-full bg-white overflow-hidden ring-1 ring-white/30 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <img
                  src="/media/mohr-logo.png"
                  alt="لوگوی سامانه"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-lg leading-tight">سیمرغ تأمین دریا</div>
                <div className="text-cyan-300 text-[10px] leading-tight">بازارگاه تجهیزات و قطعات شناورها</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    loc.pathname === link.to
                      ? "text-white bg-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/products"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="جستجو"
              >
                <Search className="w-5 h-5" />
              </Link>

              <Link
                to="/favorites"
                className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </motion.span>
                )}
              </Link>

              {user && user.role !== "buyer" && (
                <Link
                  to={user.role === "admin" ? "/admin" : "/seller"}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${
                    user.role === "admin"
                      ? "bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30"
                      : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                  }`}
                >
                  {user.role === "admin" ? <Shield className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                  {user.role === "admin" ? "پنل مدیریت" : "پنل فروشگاه"}
                </Link>
              )}

              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-l from-cyan-600 to-blue-700 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
                      >
                        <div className="p-4 bg-gradient-to-bl from-cyan-50 to-blue-50 border-b border-slate-100">
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p dir="ltr" className="text-xs text-slate-500 text-left">{user.mobile}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === "admin" ? "bg-rose-100 text-rose-700" :
                            user.role === "seller" ? "bg-purple-100 text-purple-700" :
                            "bg-cyan-100 text-cyan-700"
                          }`}>
                            {user.role === "admin" ? "ادمین" : user.role === "seller" ? "تأمین‌کننده" : "خریدار"}
                          </span>
                        </div>
                        {user.role === "buyer" && (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                            >
                              <UserIcon className="w-4 h-4 text-cyan-600" />
                              پروفایل کامل
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                            >
                              <Package className="w-4 h-4 text-cyan-600" />
                              سفارش‌های من
                            </Link>
                            <Link
                              to="/favorites"
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                            >
                              <Heart className="w-4 h-4 text-rose-500" />
                              علاقه‌مندی‌ها
                            </Link>
                            <Link
                              to="/my-rfqs"
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                            >
                              <Search className="w-4 h-4 text-emerald-500" />
                              درخواست‌های استعلام من
                            </Link>
                          </>
                        )}
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Shield className="w-4 h-4 text-cyan-600" />
                            رفتن به پنل مدیریت
                          </Link>
                        )}
                        {user.role === "seller" && (
                          <Link
                            to="/seller"
                            onClick={() => setUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Store className="w-4 h-4 text-purple-600" />
                            رفتن به پنل فروشگاه
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                        >
                          <LogOut className="w-4 h-4" />
                          خروج از حساب
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-l from-cyan-600 to-blue-700 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition"
                >
                  <UserIcon className="w-4 h-4" />
                  ورود / ثبت‌نام
                </button>
              )}

              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      loc.pathname === link.to
                        ? "text-white bg-white/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Panel access for mobile */}
                <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                  <div className="px-4 py-1 text-[10px] text-cyan-300 font-bold uppercase">
                    دسترسی به پنل‌ها
                  </div>
                  <Link
                    to="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-cyan-200 hover:bg-cyan-500/10"
                  >
                    <Shield className="w-4 h-4" />
                    پنل مدیریت
                  </Link>
                    <Link
                      to="/admin/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-purple-200 hover:bg-purple-500/10"
                    >
                      <Store className="w-4 h-4" />
                      پنل تأمین‌کننده
                    </Link>
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/10">
                    {user ? (
                      <div className="space-y-1">
                        <div className="px-4 py-2 text-sm text-slate-300">
                          <span className="text-white font-semibold">سلام {greetingTitle}{firstName ? ` ${firstName}` : ""}</span>
                          <span dir="ltr" className="block text-xs opacity-70 text-left">{user.mobile}</span>
                        </div>
                        {user.role === "buyer" && (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm text-cyan-300 hover:bg-cyan-500/10 rounded-lg"
                            >
                              پروفایل کامل
                            </Link>
                            <Link
                              to="/my-rfqs"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm text-emerald-300 hover:bg-emerald-500/10 rounded-lg"
                            >
                              استعلام‌های من
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
                            >
                              سفارش‌های من
                            </Link>
                            <Link
                              to="/favorites"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
                            >
                              علاقه‌مندی‌ها
                            </Link>
                          </>
                        )}
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        خروج
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-l from-cyan-600 to-blue-700 text-white text-sm font-semibold"
                    >
                      ورود / ثبت‌نام
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <div className="pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-0 flex items-start justify-center">
              <Link
                to={user.role === "buyer" ? "/profile" : user.role === "seller" ? "/seller/profile" : "/admin"}
                className="pointer-events-auto group mt-2 flex min-w-0 items-center gap-2 rounded-full border border-cyan-400/25 bg-slate-950/75 px-4 py-1.5 text-cyan-100 shadow-[0_10px_30px_rgba(8,145,178,0.22)] backdrop-blur-xl hover:bg-slate-900/85 hover:border-cyan-300/40 transition"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm font-bold">
                  سلام {greetingTitle}{firstName ? ` ${firstName}` : ""}
                </span>
                <UserIcon className="w-3.5 h-3.5 text-cyan-200 opacity-80 group-hover:opacity-100 flex-shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
