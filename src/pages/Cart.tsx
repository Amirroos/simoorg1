import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle2, MapPin, Truck, CreditCard, AlertCircle } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatPriceToman, getProductImageSource } from "../data/products";

export function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, user, checkout } = useApp();
  const [authRequired, setAuthRequired] = useState(false);
  const [address, setAddress] = useState("");
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [qtyError, setQtyError] = useState<{ id: string; msg: string } | null>(null);

  const tryUpdateQty = (productId: string, qty: number) => {
    const res = updateQty(productId, qty);
    if (!res.ok && res.reason) {
      setQtyError({ id: productId, msg: res.reason });
      setTimeout(() => setQtyError(null), 2500);
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = subtotal > 0 ? 5_000_000 : 0; // 500,000 toman
  const tax = Math.round(subtotal * 0.09); // 9%
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      setAuthRequired(true);
      return;
    }
    if (!address || address.length < 10) {
      alert("لطفاً آدرس تحویل را به طور کامل وارد کنید");
      return;
    }
    const order = checkout(address);
    if (order) {
      setOrderId(order.id);
      setCheckoutDone(true);
    }
  };

  if (checkoutDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">سفارش شما ثبت شد!</h2>
          <p className="text-slate-600 mb-6">
            شماره سفارش شما: <span dir="ltr" className="font-bold text-cyan-700">{orderId}</span>
          </p>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 mb-6 text-right">
            <p className="text-sm text-slate-700 leading-7">
              سفارش شما در حال آماده‌سازی است. پس از ارسال، کد رهگیری از طریق پیامک و ایمیل برای شما ارسال خواهد شد.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/orders"
              className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
            >
              پیگیری سفارش
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              بازگشت به خانه
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">سبد خرید شما خالی است</h2>
          <p className="text-slate-600 mb-6">محصولات مورد نظر خود را به سبد اضافه کنید</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
          >
            مشاهده محصولات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">سبد خرید</h1>
            <p className="text-sm text-slate-500">{cart.length.toLocaleString("fa-IR")} کالا در سبد شما</p>
          </div>
          <button
            onClick={() => {
              if (confirm("آیا از پاک کردن همه کالاها مطمئن هستید؟")) clearCart();
            }}
            className="text-sm text-rose-600 hover:text-rose-700 font-semibold"
          >
            پاک کردن همه
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Items */}
          <div className="space-y-3">
            {cart.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 flex gap-4"
              >
                <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                  <img
                    src={getProductImageSource(item.product)}
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="font-bold text-slate-800 hover:text-cyan-700 transition line-clamp-2 text-sm md:text-base leading-7"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{item.product.brand}</span>
                    <span>•</span>
                    <span>سیمرغ تامین دریا</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => tryUpdateQty(item.product.id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-800">{item.qty.toLocaleString("fa-IR")}</span>
                        <button
                          onClick={() => tryUpdateQty(item.product.id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {qtyError?.id === item.product.id && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-rose-600">
                          <AlertCircle className="w-3 h-3" />
                          {qtyError.msg}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-[10px] text-slate-500">مبلغ کل</div>
                        <div className="font-black text-slate-900 text-sm md:text-base">
                          {formatPriceToman(item.product.price * item.qty)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-9 h-9 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-600" />
                خلاصه سفارش
              </h3>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>مبلغ کالاها</span>
                  <span>{formatPriceToman(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>هزینه ارسال</span>
                  <span>{formatPriceToman(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>مالیات و عوارض (۹٪)</span>
                  <span>{formatPriceToman(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-black mb-5">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-cyan-700">{formatPriceToman(total)}</span>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  آدرس تحویل
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="استان، شهر، خیابان، پلاک، واحد، کد پستی..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none resize-none text-sm"
                />
              </div>

              {authRequired && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  برای ثبت سفارش ابتدا وارد حساب کاربری خود شوید.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={!user}
                className="w-full py-3.5 rounded-xl bg-gradient-to-l from-cyan-600 to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Truck className="w-5 h-5" />
                {user ? "نهایی‌سازی و پرداخت" : "ابتدا وارد شوید"}
              </button>

              {!user && (
                <Link
                  to="/"
                  className="block text-center text-sm text-cyan-700 hover:underline mt-3"
                  onClick={() => {
                    const event = new CustomEvent("openAuthModal");
                    window.dispatchEvent(event);
                  }}
                >
                  ورود / ثبت‌نام
                </Link>
              )}

              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>پرداخت امن از طریق درگاه بانکی با ضمانت بازگشت وجه</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
