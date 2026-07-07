import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Truck,
  Shield,
  Award,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  AlertCircle,
  ChevronLeft,
  Package,
} from "lucide-react";
import { detailedSubcategories, formatPriceToman, productGroups } from "../data/products";
import { useApp } from "../contexts/AppContext";
import { ProductCard } from "../components/ProductCard";
import { formatPersianDate } from "../utils/persianDate";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user, addReview, reviews, favorites, toggleFavorite } = useApp();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "seller">("desc");
  const [addedToCart, setAddedToCart] = useState(false);
  const [stockError, setStockError] = useState("");

  const product = products.find((p) => p.id === id);
  const productGroup = product ? productGroups.find((group) => group.id === product.productGroupId) : null;
  const subcategory = product ? detailedSubcategories.find((item) => item.id === product.subcategoryId) : null;
  const productReviews = reviews.filter((r) => r.productId === id);
  const relatedProducts = product
    ? products
        .filter((p) => p.productGroupId === product.productGroupId && p.id !== product.id)
        .slice(0, 4)
    : [];
  const isFavorite = product ? favorites.includes(product.id) : false;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">محصول یافت نشد</h2>
          <Link to="/products" className="text-cyan-700 hover:underline">
            بازگشت به محصولات
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const res = addToCart(product);
    if (!res.ok && res.reason) {
      setStockError(res.reason);
      setTimeout(() => setStockError(""), 3000);
      return;
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // نمایش پیام نیاز به ورود
      return;
    }
    if (reviewText.length < 10) return;
    const success = addReview({
      productId: product.id,
      rating: reviewRating,
      comment: reviewText,
    });
    if (success) {
      setReviewSuccess(true);
      setReviewText("");
      setReviewRating(5);
      setTimeout(() => setReviewSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-cyan-700 whitespace-nowrap">خانه</Link>
            <ChevronLeft className="w-3 h-3 flex-shrink-0" />
            <Link to="/products" className="hover:text-cyan-700 whitespace-nowrap">محصولات</Link>
            {productGroup && (
              <>
                <ChevronLeft className="w-3 h-3 flex-shrink-0" />
                <Link to={`/products?group=${productGroup.id}`} className="hover:text-cyan-700 whitespace-nowrap">
                  {productGroup.name}
                </Link>
              </>
            )}
            <ChevronLeft className="w-3 h-3 flex-shrink-0" />
            <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Left: Image + Details */}
          <div>
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-4"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.src.endsWith("/media/product-pump.webp")) return;
                    event.currentTarget.src = "/media/product-pump.webp";
                  }}
                />
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {product.condition === "refurbished" && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-white shadow">
                      بازسازی‌شده
                    </span>
                  )}
                  {product.stock > 0 && product.stock < 5 && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500 text-white shadow">
                      فقط {product.stock} عدد در انبار
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center transition ${
                    isFavorite
                      ? "bg-rose-500 text-white"
                      : "bg-white/80 backdrop-blur text-slate-700 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>
            </motion.div>

            {/* Title & Short Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{product.brand}</span>
                    <span>•</span>
                    <span>مدل {product.model}</span>
                    <span>•</span>
                    <span>{product.country}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {product.name}
                  </h1>
                </div>
                <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm transition">
                  <Share2 className="w-4 h-4" />
                  اشتراک
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold">{product.rating.toLocaleString("fa-IR")}</span>
                </div>
                <span className="text-sm text-slate-500">
                  از {product.reviewCount.toLocaleString("fa-IR")} نظر
                </span>
                <span className="text-sm text-emerald-600 font-semibold">✓ تأیید شده</span>
              </div>

              {/* Vessel compatibility */}
              {(productGroup || subcategory) && (
                <div className="mt-4">
                  <div className="text-sm text-slate-600 mb-2 font-medium">گروه محصول:</div>
                  <div className="flex flex-wrap gap-2">
                    {productGroup && (
                      <span className="px-3 py-1 text-xs rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 font-semibold">
                        {productGroup.name}
                      </span>
                    )}
                    {subcategory && (
                      <span className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                        {subcategory.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Vessel compatibility */}
              <div className="mt-4">
                <div className="text-sm text-slate-600 mb-2 font-medium">سازگار با:</div>
                <div className="flex flex-wrap gap-2">
                  {product.vesselTypes.map((v) => (
                    <span
                      key={v}
                      className="px-3 py-1 text-xs rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold"
                    >
                      ⚓ {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                {[
                  { id: "desc", label: "توضیحات" },
                  { id: "specs", label: "مشخصات فنی" },
                  { id: "reviews", label: `نظرات (${productReviews.length})` },
                  { id: "seller", label: "درباره فروشنده" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition relative ${
                      activeTab === tab.id
                        ? "text-cyan-700"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-600"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "desc" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-slate-700 leading-8 text-justify">{product.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <Shield className="w-5 h-5 text-emerald-600 mb-1" />
                        <div className="text-xs text-emerald-700 font-semibold">ضمانت اصالت</div>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                        <Truck className="w-5 h-5 text-cyan-600 mb-1" />
                        <div className="text-xs text-cyan-700 font-semibold">ارسال {product.leadTime} روزه</div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <Award className="w-5 h-5 text-amber-600 mb-1" />
                        <div className="text-xs text-amber-700 font-semibold">کیفیت تأیید شده</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "specs" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="divide-y divide-slate-100">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex items-center py-3">
                          <div className="w-1/3 text-sm text-slate-500">{key}</div>
                          <div className="flex-1 text-sm font-semibold text-slate-800">{value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Review form */}
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-l from-cyan-50 to-blue-50 border border-cyan-100">
                      <h4 className="font-bold mb-3 text-slate-800">نظر خود را ثبت کنید</h4>
                      {reviewSuccess ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-5 h-5" />
                          نظر شما ثبت شد
                        </div>
                      ) : (
                        <form onSubmit={handleReviewSubmit}>
                          <div className="mb-3">
                            <div className="text-sm text-slate-600 mb-1">امتیاز شما:</div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setReviewRating(n)}
                                  className="transition hover:scale-110"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      n <= reviewRating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="تجربه خود از خرید این محصول را بنویسید..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none resize-none mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {reviewText.length}/10 حداقل کاراکتر
                            </span>
                            <button
                              type="submit"
                              disabled={!user || reviewText.length < 10}
                              className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-700 transition"
                            >
                              {user ? "ثبت نظر" : "ابتدا وارد شوید"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {productReviews.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                          <p>هنوز نظری ثبت نشده. اولین نفر باشید!</p>
                        </div>
                      ) : (
                        productReviews.map((r) => (
                          <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-bold">
                                  {r.userName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-slate-800">{r.userName}</div>
                                  <div className="text-xs text-slate-500">{formatPersianDate(r.createdAt)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < r.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {r.verified && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold mb-2">
                                <CheckCircle2 className="w-3 h-3" />
                                خریدار تأیید شده
                              </div>
                            )}
                            <p className="text-sm text-slate-700 leading-7">{r.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "seller" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg">
                        {product.sellerName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-1">{product.sellerName}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{product.sellerScore.toLocaleString("fa-IR")}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">فروشنده تأیید شده</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                            <span>بندرعباس</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-cyan-600" />
                            <span dir="ltr">076-3300-0000</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-cyan-600" />
                            <span>۱۲۵ کالای فعال</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-cyan-600" />
                            <span>۸ سال سابقه</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-bold mb-3">تعهدات فروشنده</h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>ضمانت اصالت کالا با امکان مرجوعی تا ۷ روز</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>ارسال در بازه زمانی اعلام شده</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>پاسخگویی به سوالات فنی قبل از خرید</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Purchase Card */}
          <div>
            <div className="sticky top-20 space-y-4">
              {/* Main card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                {product.hasPrice ? (
                  <div className="mb-4">
                    <div className="text-sm text-slate-500 mb-1">قیمت</div>
                    <div className="text-3xl font-black text-slate-900">
                      {formatPriceToman(product.price)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">مالیات و حمل جداگانه محاسبه می‌شود</div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                    <div className="flex items-center gap-2 text-cyan-700 font-bold mb-1">
                      <AlertCircle className="w-5 h-5" />
                      قیمت استعلامی
                    </div>
                    <div className="text-sm text-slate-700">
                      برای دریافت قیمت، درخواست RFQ ثبت کنید یا با فروشنده تماس بگیرید.
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div className="mb-4 flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-emerald-700 font-semibold">
                        موجود در انبار ({product.stock.toLocaleString("fa-IR")} عدد)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-sm text-rose-700 font-semibold">ناموجود</span>
                    </>
                  )}
                </div>

                {/* Quick info */}
                <div className="space-y-2 mb-5 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-cyan-600" />
                    <span className="text-slate-700">زمان آماده‌سازی:</span>
                    <span className="font-bold text-slate-900 mr-auto">{product.leadTime.toLocaleString("fa-IR")} روز</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span className="text-slate-700">ارسال از:</span>
                    <span className="font-bold text-slate-900 mr-auto">بندرعباس</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    <span className="text-slate-700">ضمانت اصالت:</span>
                    <span className="font-bold text-emerald-600 mr-auto">✓ دارد</span>
                  </div>
                </div>

                {stockError && (
                  <div className="mb-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {stockError}
                  </div>
                )}

                {/* Actions */}
                {product.hasPrice && product.stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
                      addedToCart
                        ? "bg-emerald-600 shadow-emerald-500/30"
                        : "bg-gradient-to-l from-cyan-600 to-blue-700 shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        به سبد اضافه شد
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        افزودن به سبد خرید
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={product.hasPrice ? "/rfq" : `/rfq?productId=${product.id}`}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-l from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2"
                  >
                    ثبت درخواست استعلام
                  </Link>
                )}

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`w-full mt-3 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border-2 ${
                    isFavorite
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-slate-200 text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی"}
                </button>
              </div>

              {/* Seller card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-black shadow-lg">
                    {product.sellerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{product.sellerName}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{product.sellerScore.toLocaleString("fa-IR")}</span>
                      <span className="text-emerald-600 mr-1">• تأیید شده</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition">
                    مشاهده فروشگاه
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold transition">
                    تماس با فروشنده
                  </button>
                </div>
              </div>

              {/* Trust */}
              <div className="bg-gradient-to-bl from-emerald-50 to-cyan-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-800">خرید امن</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    تضمین بازگشت وجه در صورت مغایرت
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    پرداخت امن از طریق درگاه بانکی
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    پشتیبانی ۲۴ ساعته برای پیگیری سفارش
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-6">محصولات مرتبط</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
