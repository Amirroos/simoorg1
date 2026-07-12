import { Phone, Mail, MapPin, Send, MessageCircle, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { productGroups } from "../data/products";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 overflow-hidden">
      {/* Wave */}
      <div className="absolute top-0 inset-x-0 h-16">
        <svg viewBox="0 0 1440 60" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z"
            fill="#f8fafc"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden ring-1 ring-white/30 shadow-lg shadow-cyan-500/20">
                <img src="/media/mohr-logo.png" alt="لوگوی سامانه" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <div className="text-white font-bold">سیمرغ تأمین دریا</div>
                <div className="text-xs text-cyan-300">بازارگاه تجهیزات و قطعات شناورها</div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              اولین بازارگاه تخصصی B2B قطعات و تجهیزات شناورها در ایران. اتصال مستقیم خریداران
              به فروشندگان تأییدشده.
            </p>
            <div className="flex gap-2 mt-5">
              {[Camera, Send, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cyan-600 flex items-center justify-center transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-cyan-300 transition">محصولات</Link></li>
              <li><Link to="/categories" className="hover:text-cyan-300 transition">گروه‌های محصول</Link></li>
              <li><Link to="/rfq" className="hover:text-cyan-300 transition">دریا یار</Link></li>
              <li><Link to="/orders" className="hover:text-cyan-300 transition">سفارش‌های من</Link></li>
              <li><a href="#" className="hover:text-cyan-300 transition">فروشندگان برتر</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">قوانین و مقررات</a></li>
            </ul>
          </div>

          {/* Product Groups */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">گروه محصول</h4>
            <ul className="space-y-2.5 text-sm">
              {productGroups.slice(0, 10).map((group) => (
                <li key={group.id}>
                  <Link to={`/products?group=${group.id}`} className="hover:text-cyan-300 transition">
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">تماس با ما</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                <span>بندرعباس، اسکله شهید رجایی، مرکز تجاری سیمرغ</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span dir="ltr">076-3355-8800</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>support@simorgh-marine.ir</span>
              </li>
            </ul>
            <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400 mb-1">پشتیبانی ۲۴ ساعته</div>
              <div dir="ltr" className="text-sm font-bold text-white">0939-SIMORGH</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© ۱۴۰۵ کلیه حقوق این بازارگاه متعلق به شرکت سیمرغ تأمین دریا می‌باشد.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-cyan-300">حریم خصوصی</a>
            <a href="#" className="hover:text-cyan-300">شرایط استفاده</a>
            <Link to="/admin/login" className="hover:text-cyan-300">پنل مدیریت</Link>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              سامانه فعال
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
