import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, User as UserIcon, KeyRound, Loader2, AlertCircle, Anchor } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

export function AdminLogin() {
  const { loginWithCredentials, user } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") navigate("/admin");
    if (user?.role === "seller") navigate("/seller");
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const u = loginWithCredentials(username.trim(), password);
      setLoading(false);
      if (!u) {
        setError("نام کاربری یا رمز عبور صحیح نیست");
        return;
      }
      if (u.role === "admin") navigate("/admin");
      else if (u.role === "seller") navigate("/seller");
      else setError("این حساب کاربری دسترسی به پنل ندارد");
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-bl from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 text-white mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center shadow-2xl shadow-cyan-500/40">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-lg">سیمرغ تأمین دریا</div>
            <div className="text-xs text-cyan-300">Marine Supply Platform</div>
          </div>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-100 mb-3">
              <Shield className="w-8 h-8 text-cyan-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">ورود به پنل مدیریت</h1>
            <p className="text-sm text-slate-500 mt-1">برای دسترسی به پنل، ابتدا وارد شوید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                نام کاربری
              </label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition text-left"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                "ورود به پنل"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                اطلاعات ورود تست:
              </div>
              <div>
                <span className="font-semibold">مدیر سیستم:</span>{" "}
                <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">admin</span> /{" "}
                <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">admin</span>
              </div>
              <div>
                <span className="font-semibold">تأمین‌کننده دمو:</span>{" "}
                <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">09171000001</span> /{" "}
                <span dir="ltr" className="font-mono bg-white px-2 py-0.5 rounded">09171000001</span>
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="block text-center text-sm text-cyan-200 hover:text-white mt-6 transition"
        >
          ← بازگشت به سایت
        </Link>
      </motion.div>
    </div>
  );
}
