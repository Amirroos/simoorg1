import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "../data/products";
import { normalizeProductTaxonomy, products as seedProducts } from "../data/products";

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: "buyer" | "seller" | "admin";
  avatar?: string;
  createdAt: string;
  nationalId?: string;
  birthDate?: string;
  city?: string;
  address?: string;
  maritimeProfile?: MaritimeProfile;
  // برای تأمین‌کننده
  companyName?: string;
  location?: string;
  status?: "active" | "pending" | "suspended";
  rating?: number;
  // برای ادمین: ورود با یوزرنیم/پسورد
  username?: string;
}

export interface MaritimeProfile {
  rank?: string;
  seafarerCode?: string;
  vesselType?: string;
  vesselName?: string;
  vesselImo?: string;
  homePort?: string;
  organization?: string;
  yearsExperience?: string;
  licenseNumber?: string;
  licenseExpiresAt?: string;
  certificates?: string[];
  specialties?: string[];
  emergencyContact?: string;
  emergencyMobile?: string;
  attachmentNames?: string[];
  notes?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  userId: string;
  userName?: string;
  userMobile?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
  address: string;
}

export interface RFQItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  specs: string;
}

export interface RFQBid {
  id: string;
  sellerId: string;
  sellerName: string;
  price: number;
  description: string;
  createdAt: string;
}

export interface RFQ {
  id: string;
  buyerId: string;
  buyerName: string;
  requestType: "missing_product" | "product_price";
  productId?: string;
  productName?: string;
  productSellerId?: string;
  productSellerName?: string;
  title: string;
  categoryId: string;
  productGroupId?: string;
  subcategoryId?: string;
  vesselType: string;
  urgency: string;
  neededBy: string;
  deliveryLocation: string;
  description: string;
  items: RFQItem[];
  status: "open" | "published" | "closed";
  bids: RFQBid[];
  createdAt: string;
}

export function isRFQPublished(rfq: RFQ) {
  if (rfq.status === "published" || rfq.status === "closed") return true;
  const createdAt = new Date(rfq.createdAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt >= sevenDays;
}

interface AppState {
  user: User | null;
  users: User[];
  products: Product[];
  login: (mobile: string, name: string, role?: User["role"], profile?: Partial<User>) => boolean;
  loginWithCredentials: (username: string, password: string) => User | null;
  logout: () => void;

  // user management (admin)
  addUser: (data: Partial<User> & { name: string; mobile: string; role: User["role"] }) => User | null;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleSellerStatus: (id: string) => void;

  // product management
  addProduct: (data: Omit<Product, "id" | "gallery" | "rating" | "reviewCount">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // cart
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => { ok: boolean; reason?: string };
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => { ok: boolean; reason?: string };
  clearCart: () => void;

  // reviews
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt" | "userName" | "userId" | "verified">) => boolean;

  // favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  // orders
  orders: Order[];
  checkout: (address: string) => Order | null;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;

  // RFQs
  rfqs: RFQ[];
  addRFQ: (data: Omit<RFQ, "id" | "status" | "bids" | "createdAt" | "buyerId" | "buyerName">) => RFQ | null;
  addRFQBid: (rfqId: string, bidData: { price: number; description: string }) => void;
  publishRFQ: (rfqId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

// === مقادیر اولیه ===
const ADMIN_USER: User = {
  id: "u-admin",
  name: "مدیر سیستم",
  username: "admin",
  mobile: "09120000000",
  email: "admin@simorgh-marine.ir",
  role: "admin",
  createdAt: "2025-01-01T00:00:00Z",
  status: "active",
};

const SEED_USERS: User[] = [
  ADMIN_USER,
  {
    id: "u-seller-1",
    name: "مدیر فروشگاه خلیج",
    mobile: "09171000001",
    role: "seller",
    companyName: "تأمین قطعات خلیج",
    location: "بندرعباس",
    status: "active",
    rating: 4.9,
    createdAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "u-seller-2",
    name: "مدیر الکترو مارین",
    mobile: "09171000002",
    role: "seller",
    companyName: "الکترو مارین پارس",
    location: "بوشهر",
    status: "active",
    rating: 4.7,
    createdAt: "2025-03-10T00:00:00Z",
  },
  {
    id: "u-seller-3",
    name: "مدیر ناوبران دریا",
    mobile: "09171000003",
    role: "seller",
    companyName: "ناوبران دریا",
    location: "تهران",
    status: "active",
    rating: 4.95,
    createdAt: "2025-04-01T00:00:00Z",
  },
  {
    id: "u-seller-4",
    name: "مدیر ایمن دریا",
    mobile: "09171000004",
    role: "seller",
    companyName: "ایمن دریا",
    location: "انزلی",
    status: "active",
    rating: 4.85,
    createdAt: "2025-04-20T00:00:00Z",
  },
  {
    id: "u-seller-5",
    name: "مدیر موتورهای دریایی",
    mobile: "09171000005",
    role: "seller",
    companyName: "موتورهای دریایی پارس",
    location: "خرمشهر",
    status: "active",
    rating: 4.8,
    createdAt: "2025-05-05T00:00:00Z",
  },
  {
    id: "u-buyer-demo",
    name: "علی محمدی",
    mobile: "09121234567",
    role: "buyer",
    status: "active",
    createdAt: "2025-09-10T00:00:00Z",
  },
];

const REVIEWS_SEED: Review[] = [
  {
    id: "r-1",
    productId: "p-001",
    userId: "u-demo-1",
    userName: "کاپیتان محمدی",
    rating: 5,
    comment: "پمپ فوق‌العاده بود. بعد از 6 ماه کار مداوم روی شناور، هیچ مشکلی نداره. کیفیت ساخت هلندی واقعاً مشخصه.",
    createdAt: "2025-11-15",
    verified: true,
  },
  {
    id: "r-2",
    productId: "p-001",
    userId: "u-demo-2",
    userName: "آقای رضایی",
    rating: 4,
    comment: "کیفیت خوب و ارسال سریع. فقط قیمت کمی بالا بود ولی با توجه به اصالت کالا ارزشش رو داره.",
    createdAt: "2025-12-02",
    verified: true,
  },
  {
    id: "r-3",
    productId: "p-004",
    userId: "u-demo-3",
    userName: "صیادان بندر",
    rating: 5,
    comment: "لنگر عالی برای قایق صیادی. چسبندگی در بستر گلی بسیار قوی است.",
    createdAt: "2026-01-08",
    verified: true,
  },
  {
    id: "r-4",
    productId: "p-007",
    userId: "u-demo-4",
    userName: "احمدی",
    rating: 5,
    comment: "سونار بسیار دقیق، صفحه واضح و نصب راحت. برای ماهیگیری عالی کار می‌کنه.",
    createdAt: "2026-02-10",
    verified: true,
  },
  {
    id: "r-5",
    productId: "p-010",
    userId: "u-demo-5",
    userName: "افسر ایمنی",
    rating: 4,
    comment: "کیفیت استاندارد SOLAS دارد. برای ناوگان تجاری مناسب است.",
    createdAt: "2026-01-22",
    verified: true,
  },
];

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStored<User | null>("simorgh_user", null));
  const [users, setUsers] = useState<User[]>(() => loadStored<User[]>("simorgh_users", SEED_USERS));
  const [products, setProducts] = useState<Product[]>(() =>
    loadStored<Product[]>("simorgh_products", seedProducts).map(normalizeProductTaxonomy)
  );
  const [cart, setCart] = useState<CartItem[]>(() => loadStored<CartItem[]>("simorgh_cart", []));
  const [reviews, setReviews] = useState<Review[]>(() => loadStored<Review[]>("simorgh_reviews", REVIEWS_SEED));
  const [favorites, setFavorites] = useState<string[]>(() => loadStored<string[]>("simorgh_favorites", []));
  const [orders, setOrders] = useState<Order[]>(() => loadStored<Order[]>("simorgh_orders", []));
  const [rfqs, setRfqs] = useState<RFQ[]>(() => loadStored<RFQ[]>("simorgh_rfqs", []));

  useEffect(() => {
    if (user) localStorage.setItem("simorgh_user", JSON.stringify(user));
    else localStorage.removeItem("simorgh_user");
  }, [user]);
  useEffect(() => { localStorage.setItem("simorgh_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("simorgh_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("simorgh_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("simorgh_reviews", JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem("simorgh_favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("simorgh_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("simorgh_rfqs", JSON.stringify(rfqs)); }, [rfqs]);

  // === Auth ===
  const login = (mobile: string, name: string, role: User["role"] = "buyer", profile: Partial<User> = {}) => {
    if (!mobile || mobile.length < 10) return false;
    if (!name || name.length < 3) return false;

    // اگر کاربر با این موبایل قبلاً وجود دارد، لاگین به همان
    const existing = users.find((u) => u.mobile === mobile);
    if (existing) {
      setUser(existing);
      return true;
    }

    const newUser: User = {
      ...profile,
      id: "u-" + Date.now(),
      name,
      mobile,
      role,
      status: profile.status || "active",
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const loginWithCredentials = (username: string, password: string): User | null => {
    // ادمین پیش‌فرض admin/admin
    if (username === "admin" && password === "admin") {
      const adminUser = users.find((u) => u.username === "admin") || ADMIN_USER;
      setUser(adminUser);
      return adminUser;
    }
    // فروشنده‌ها می‌توانند با مدل username=mobile و password=mobile وارد شوند (برای دمو)
    const seller = users.find((u) => u.role === "seller" && (u.mobile === username || u.username === username));
    if (seller && password === seller.mobile) {
      setUser(seller);
      return seller;
    }
    return null;
  };

  const logout = () => setUser(null);

  // === User management (admin) ===
  const addUser: AppState["addUser"] = (data) => {
    if (!data.name || !data.mobile) return null;
    if (users.some((u) => u.mobile === data.mobile)) return null;
    const newUser: User = {
      id: "u-" + Date.now(),
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      role: data.role,
      nationalId: data.nationalId,
      birthDate: data.birthDate,
      city: data.city,
      address: data.address,
      maritimeProfile: data.maritimeProfile,
      companyName: data.companyName,
      location: data.location,
      status: data.status || "active",
      rating: data.rating || 5,
      username: data.username,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser: AppState["updateUser"] = (id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    if (user?.id === id) setUser((u) => (u ? { ...u, ...patch } : u));
  };

  const deleteUser: AppState["deleteUser"] = (id) => {
    if (id === ADMIN_USER.id) return; // محافظت از ادمین اصلی
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (user?.id === id) setUser(null);
  };

  const toggleSellerStatus: AppState["toggleSellerStatus"] = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  // === Product management ===
  const addProduct: AppState["addProduct"] = (data) => {
    const newProduct: Product = {
      id: "p-" + Date.now(),
      ...data,
      gallery: [],
      rating: 5,
      reviewCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct: AppState["updateProduct"] = (id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProduct: AppState["deleteProduct"] = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // === Cart with stock control ===
  const addToCart: AppState["addToCart"] = (product, qty = 1) => {
    // بررسی وضعیت محصول و موجودی
    const current = products.find((p) => p.id === product.id);
    if (!current || current.stock <= 0) {
      return { ok: false, reason: "اتمام موجودی" };
    }
    const existing = cart.find((i) => i.product.id === product.id);
    const requestedTotal = (existing?.qty || 0) + qty;
    if (requestedTotal > current.stock) {
      return { ok: false, reason: `حداکثر ${current.stock.toLocaleString("fa-IR")} عدد قابل سفارش است` };
    }
    setCart((prev) => {
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty, product: current } : i
        );
      }
      return [...prev, { product: current, qty }];
    });
    return { ok: true };
  };

  const removeFromCart: AppState["removeFromCart"] = (productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty: AppState["updateQty"] = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return { ok: true };
    }
    const current = products.find((p) => p.id === productId);
    if (!current) return { ok: false, reason: "محصول یافت نشد" };
    if (qty > current.stock) {
      return { ok: false, reason: `حداکثر ${current.stock.toLocaleString("fa-IR")} عدد موجود است` };
    }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)));
    return { ok: true };
  };

  const clearCart = () => setCart([]);

  // === Reviews ===
  const addReview: AppState["addReview"] = (review) => {
    if (!user) return false;
    const already = reviews.find(
      (r) => r.productId === review.productId && r.userId === user.id
    );
    if (already) return false;
    const newReview: Review = {
      ...review,
      id: "r-" + Date.now(),
      userId: user.id,
      userName: user.name,
      verified: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [newReview, ...prev]);
    // به‌روزرسانی امتیاز و تعداد نظر محصول
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== review.productId) return p;
        const all = [...reviews.filter((r) => r.productId === p.id), newReview];
        const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
        return { ...p, rating: Math.round(avg * 10) / 10, reviewCount: all.length };
      })
    );
    return true;
  };

  // === Favorites ===
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // === Orders with stock decrement ===
  const checkout: AppState["checkout"] = (address) => {
    if (!user || cart.length === 0) return null;
    // مجدد بررسی موجودی
    for (const item of cart) {
      const current = products.find((p) => p.id === item.product.id);
      if (!current || current.stock < item.qty) return null;
    }
    const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const order: Order = {
      id: "ORD-" + Date.now().toString().slice(-8),
      items: cart,
      userId: user.id,
      userName: user.name,
      userMobile: user.mobile,
      status: "paid",
      total,
      address,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    // کاهش موجودی محصولات
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((i) => i.product.id === p.id);
        if (!cartItem) return p;
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      })
    );
    setCart([]);
    return order;
  };

  const updateOrderStatus: AppState["updateOrderStatus"] = (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  // === RFQs ===
  const addRFQ: AppState["addRFQ"] = (data) => {
    if (!user || user.role !== "buyer") return null;
    const newRfq: RFQ = {
      ...data,
      id: "RFQ-" + Date.now().toString().slice(-6),
      buyerId: user.id,
      buyerName: user.name,
      status: "open",
      bids: [],
      createdAt: new Date().toISOString(),
    };
    setRfqs(prev => [newRfq, ...prev]);
    return newRfq;
  };

  const addRFQBid: AppState["addRFQBid"] = (rfqId, bidData) => {
    if (!user || user.role !== "seller") return;
    setRfqs(prev => prev.map(r => {
      if (r.id !== rfqId) return r;
      const existingIdx = r.bids.findIndex(b => b.sellerId === user.id);
      const newBid: RFQBid = {
        id: "BID-" + Date.now(),
        sellerId: user.id,
        sellerName: user.companyName || user.name,
        price: bidData.price,
        description: bidData.description,
        createdAt: new Date().toISOString()
      };
      const newBids = [...r.bids];
      if (existingIdx >= 0) {
        newBids[existingIdx] = newBid;
      } else {
        newBids.push(newBid);
      }
      return { ...r, bids: newBids };
    }));
  };

  const publishRFQ: AppState["publishRFQ"] = (rfqId) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: "published" } : r));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        products,
        login,
        loginWithCredentials,
        logout,
        addUser,
        updateUser,
        deleteUser,
        toggleSellerStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        reviews,
        addReview,
        favorites,
        toggleFavorite,
        orders,
        checkout,
        updateOrderStatus,
        rfqs,
        addRFQ,
        addRFQBid,
        publishRFQ,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
