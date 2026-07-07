export interface Product {
  id: string;
  name: string;
  categoryId: string;
  productGroupId?: string;
  subcategoryId?: string;
  brand: string;
  model: string;
  country: string;
  price: number;
  hasPrice: boolean;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  sellerScore: number;
  stock: number;
  vesselTypes: string[];
  condition: "new" | "used" | "refurbished";
  shortDesc: string;
  description: string;
  specs: Record<string, string>;
  leadTime: number; // days
  tags?: string[];
  status?: "published" | "draft" | "pending";
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: { id: string; name: string }[];
  image: string;
}

export interface ProductGroup {
  id: string;
  name: string;
  icon: string;
  image: string;
  categoryId: string;
}

export interface DetailedSubcategoryGroup {
  id: string;
  name: string;
  productGroupIds: string[];
  subcategories: { id: string; name: string }[];
}

const imagePalettes: Record<string, [string, string, string]> = {
  deck: ["#0f766e", "#0f172a", "#f59e0b"],
  engine: ["#475569", "#111827", "#06b6d4"],
  navigation: ["#1d4ed8", "#020617", "#fbbf24"],
  safety: ["#dc2626", "#111827", "#fb923c"],
  fishing: ["#0284c7", "#064e3b", "#bef264"],
  electrical: ["#7c3aed", "#0f172a", "#22d3ee"],
  paint: ["#b45309", "#172554", "#fde68a"],
  default: ["#0e7490", "#0f172a", "#f59e0b"],
};

export function marineImage(title: string, kind: keyof typeof imagePalettes = "default") {
  const [primary, dark, accent] = imagePalettes[kind] || imagePalettes.default;
  const safeTitle = title.replace(/&/g, "و").slice(0, 42);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="0.56" stop-color="${dark}"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="glow" cx="24%" cy="22%" r="72%">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.48"/>
          <stop offset="0.44" stop-color="${accent}" stop-opacity="0.09"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
        <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <rect width="1200" height="900" fill="url(#glow)"/>
      <rect width="1200" height="900" fill="url(#grid)"/>
      <path d="M0 680 C170 620 285 720 450 664 C640 600 740 710 910 650 C1050 600 1120 620 1200 590 L1200 900 L0 900Z" fill="#0f172a" opacity="0.76"/>
      <path d="M0 734 C170 690 300 764 472 714 C650 662 805 740 1000 686 C1090 660 1150 662 1200 640" fill="none" stroke="${accent}" stroke-opacity="0.72" stroke-width="8"/>
      <g transform="translate(300 285)" opacity="0.96">
        <path d="M80 224H570C528 292 480 330 384 340H170C128 326 98 288 80 224Z" fill="#e2e8f0"/>
        <path d="M154 158H468L542 224H112Z" fill="#f8fafc"/>
        <path d="M240 72H396L432 158H212Z" fill="#cbd5e1"/>
        <rect x="256" y="98" width="42" height="34" rx="6" fill="${primary}"/>
        <rect x="318" y="98" width="42" height="34" rx="6" fill="${primary}"/>
        <path d="M404 40L470 224" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
        <circle cx="520" cy="226" r="38" fill="${accent}" opacity="0.9"/>
        <path d="M520 188V264M482 226H558" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
      </g>
      <text x="600" y="760" text-anchor="middle" direction="rtl" unicode-bidi="bidi-override"
        font-family="Tahoma, Arial, sans-serif" font-size="54" font-weight="800" fill="#ffffff">${safeTitle}</text>
      <text x="600" y="816" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="4" fill="${accent}">SIMORGH MARINE</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function imageKindForCategory(categoryId: string): keyof typeof imagePalettes {
  if (categoryId === "engine-room" || categoryId === "gasoline-boat-engine") return "engine";
  if (categoryId === "electronic") return "electrical";
  if (categoryId === "radar-communications") return "navigation";
  if (categoryId === "rescue-safety") return "safety";
  if (categoryId === "fishing-equipment") return "fishing";
  if (categoryId === "deck-hull" || categoryId === "marine-equipment-rental" || categoryId === "marine-rudder") return "deck";
  return "default";
}

const categoryImages: Record<string, string> = {
  "deck-hull": "/media/cat-deck.webp",
  "engine-room": "/media/cat-engine.webp",
  "marine-rudder": "/media/cat-rudder.webp",
  electronic: "/media/cat-electrical.webp",
  "radar-communications": "/media/cat-navigation.webp",
  "gasoline-boat-engine": "/media/cat-boat-engine.webp",
  "rescue-safety": "/media/cat-safety.webp",
  "fishing-equipment": "/media/cat-fishing.webp",
  "marine-equipment-rental": "/media/cat-rental.webp",
  "other-marine-equipment": "/media/cat-other.webp",
};

const productImages: Record<string, string> = {
  "p-001": "/media/product-pump.webp",
  "p-002": "/media/product-generator.webp",
  "p-003": "/media/product-radar.webp",
  "p-004": "/media/product-anchor.webp",
  "p-005": "/media/product-extinguisher.webp",
  "p-006": "/media/product-turbo.webp",
  "p-007": "/media/product-sonar.webp",
  "p-008": "/media/product-battery.webp",
  "p-009": "/media/product-fuel-pump.webp",
  "p-010": "/media/product-lifejacket.webp",
  "p-011": "/media/product-gearbox.webp",
  "p-012": "/media/product-paint.webp",
};

function normalizeImage(image: string | undefined, title: string, categoryId: string, productId?: string) {
  const localFallback = (productId && productImages[productId]) || categoryImages[categoryId] || marineImage(title, imageKindForCategory(categoryId));
  if (
    !image ||
    image.startsWith("data:image/svg") ||
    image.includes("images.unsplash.com") ||
    image.includes("images.pexels.com") ||
    image.includes("videos.pexels.com") ||
    (image.includes("/media/product-") && !image.endsWith(".webp"))
  ) {
    return localFallback;
  }
  return image;
}

export const categories: Category[] = [
  {
    id: "deck-hull",
    name: "عرشه و بدنه",
    icon: "Anchor",
    image: categoryImages["deck-hull"],
    subcategories: [],
  },
  {
    id: "engine-room",
    name: "موتور خانه دریایی",
    icon: "Engine",
    image: categoryImages["engine-room"],
    subcategories: [],
  },
  {
    id: "marine-rudder",
    name: "سیستم سکان دریایی",
    icon: "Anchor",
    image: categoryImages["marine-rudder"],
    subcategories: [],
  },
  {
    id: "electronic",
    name: "الکترونیکی",
    icon: "Zap",
    image: categoryImages.electronic,
    subcategories: [],
  },
  {
    id: "radar-communications",
    name: "راداری و ارتباطی دریایی",
    icon: "Compass",
    image: categoryImages["radar-communications"],
    subcategories: [],
  },
  {
    id: "gasoline-boat-engine",
    name: "موتور قایق بنزینی",
    icon: "Engine",
    image: categoryImages["gasoline-boat-engine"],
    subcategories: [],
  },
  {
    id: "rescue-safety",
    name: "امداد و نجات دریایی",
    icon: "Shield",
    image: categoryImages["rescue-safety"],
    subcategories: [],
  },
  {
    id: "fishing-equipment",
    name: "تجهیزات صیادی",
    icon: "Compass",
    image: categoryImages["fishing-equipment"],
    subcategories: [],
  },
  {
    id: "marine-equipment-rental",
    name: "اجاره تجهیزات دریایی",
    icon: "Fuel",
    image: categoryImages["marine-equipment-rental"],
    subcategories: [],
  },
  {
    id: "other-marine-equipment",
    name: "سایر تجهیزات دریایی",
    icon: "Fuel",
    image: categoryImages["other-marine-equipment"],
    subcategories: [],
  },
];

export const productGroups: ProductGroup[] = [
  { id: "propulsion", name: "محصولات پیشران", icon: "Zap", image: "/media/product-gearbox.webp", categoryId: "engine-room" },
  { id: "navigation-aids", name: "محصولات ناوبری و کمک ناوبری", icon: "Compass", image: "/media/product-radar.webp", categoryId: "radar-communications" },
  { id: "pipes-fittings-valves", name: "لوله، اتصالات و والو", icon: "Fuel", image: "/media/cat-rudder.webp", categoryId: "deck-hull" },
  { id: "ventilation-refrigeration", name: "تهویه و یخچال", icon: "Wind", image: "/media/cat-engine.webp", categoryId: "engine-room" },
  { id: "control-monitoring", name: "کنترل و مانیتورینگ", icon: "Gauge", image: "/media/product-sonar.webp", categoryId: "electronic" },
  { id: "deck-operations", name: "تجهیزات بارگیری و عملیات عرشه", icon: "Anchor", image: "/media/product-anchor.webp", categoryId: "deck-hull" },
  { id: "electrical", name: "الکتریکال", icon: "Zap", image: "/media/product-battery.webp", categoryId: "electronic" },
  { id: "safety-rescue", name: "ایمنی و نجات", icon: "Shield", image: "/media/product-lifejacket.webp", categoryId: "rescue-safety" },
  { id: "sensors", name: "انواع حسگرها", icon: "Radar", image: "/media/product-sonar.webp", categoryId: "electronic" },
  { id: "pumps-purifiers", name: "پمپ‌ها و تصفیه‌کننده‌ها", icon: "RefreshCw", image: "/media/product-pump.webp", categoryId: "engine-room" },
  { id: "accommodation-galley", name: "تجهیزات رفاهی و آشپزخانه", icon: "Utensils", image: "/media/cat-other.webp", categoryId: "other-marine-equipment" },
  { id: "telecommunications", name: "مخابرات و ارتباطات", icon: "Radio", image: "/media/cat-navigation.webp", categoryId: "radar-communications" },
  { id: "hydraulic", name: "هیدرولیک", icon: "Settings", image: "/media/cat-rudder.webp", categoryId: "marine-rudder" },
  { id: "rope-oil-grease-paint", name: "طناب و روغن و گیریس و رنگ و پوشش", icon: "PaintBucket", image: "/media/product-paint.webp", categoryId: "deck-hull" },
  { id: "other-products", name: "سایر محصولات", icon: "Package", image: "/media/cat-other.webp", categoryId: "other-marine-equipment" },
];

export function getCategoryIdForProductGroup(productGroupId: string) {
  return productGroups.find((group) => group.id === productGroupId)?.categoryId || "other-marine-equipment";
}

export const detailedSubcategoryGroups: DetailedSubcategoryGroup[] = [
  {
    id: "propulsion-details",
    name: "محصولات پیشران",
    productGroupIds: ["propulsion"],
    subcategories: [
      { id: "engine", name: "موتور" },
      { id: "gearbox", name: "گیربکس" },
      { id: "shaft-propeller", name: "شافت و پروانه" },
      { id: "stern-glands", name: "استرن گلندها" },
      { id: "bearings", name: "بیرینگ‌ها" },
      { id: "generators", name: "جنراتورها" },
      { id: "pumps", name: "پمپ‌ها" },
      { id: "hydraulic-rudder", name: "هیدرولیک و سکان" },
    ],
  },
  {
    id: "auxiliary-machinery",
    name: "ماشین‌آلات فرعی",
    productGroupIds: ["ventilation-refrigeration", "pumps-purifiers", "hydraulic", "deck-operations"],
    subcategories: [
      { id: "air-compressors", name: "انواع کمپرسورهای هوا" },
      { id: "hvac-refrigeration-systems", name: "انواع سیستم‌های تهویه و تبرید" },
      { id: "fuel-oil-sewage-purifiers", name: "انواع تصفیه‌کننده‌های سوخت و روغن و فاضلاب" },
      { id: "fresh-water-makers", name: "انواع آب‌شیرین‌کن" },
      { id: "hydraulic-systems", name: "سیستم‌های هیدرولیک" },
      { id: "winches-rotaries", name: "وینچ‌ها و دوارها" },
      { id: "cranes", name: "انواع جرثقیل‌ها" },
      { id: "fans", name: "انواع هواکش‌ها" },
    ],
  },
  {
    id: "navigation-aids-details",
    name: "گروه کمک ناوبری",
    productGroupIds: ["navigation-aids"],
    subcategories: [
      { id: "radars", name: "رادارها" },
      { id: "gps", name: "GPS" },
      { id: "ais", name: "AIS" },
      { id: "ecdis", name: "ECDIS" },
      { id: "gnss", name: "GNSS" },
      { id: "speed-logs", name: "سرعت‌سنج‌ها" },
      { id: "echo-sounder", name: "عمق‌یاب" },
      { id: "gyro-compass", name: "جایرو و قطب‌نما" },
    ],
  },
  {
    id: "telecommunications-details",
    name: "مخابرات و ارتباطات",
    productGroupIds: ["telecommunications"],
    subcategories: [
      { id: "vhf", name: "VHF" },
      { id: "uhf", name: "UHF" },
      { id: "hf", name: "HF" },
      { id: "internal-communications", name: "مخابرات داخلی" },
      { id: "talk-back", name: "TALK BACK" },
      { id: "public-address", name: "پیج عمومی" },
      { id: "ip-phone", name: "IP PHONE" },
      { id: "satellite", name: "ماهواره" },
    ],
  },
  {
    id: "electrical-details",
    name: "الکتریکال",
    productGroupIds: ["electrical"],
    subcategories: [
      { id: "electric-motors", name: "انواع الکتروموتور" },
      { id: "panels-switchboards", name: "انواع تابلو و سوئیچ‌بورد" },
      { id: "converters", name: "انواع کنورتور" },
      { id: "ups", name: "UPS" },
      { id: "cctv", name: "CCTV" },
      { id: "lighting", name: "روشنایی" },
      { id: "fire-alarm", name: "اعلام حریق" },
    ],
  },
  {
    id: "materials-details",
    name: "مواد و متریال",
    productGroupIds: ["pipes-fittings-valves", "rope-oil-grease-paint"],
    subcategories: [
      { id: "pipes-fittings", name: "لوله و اتصالات" },
      { id: "valves-piping-equipment", name: "والوها و تجهیزات روی خطوط لوله" },
      { id: "plates", name: "انواع ورق‌ها" },
      { id: "cables", name: "انواع کابل‌ها" },
      { id: "oils", name: "انواع روغن‌ها" },
      { id: "hardware", name: "انواع یراق‌آلات" },
      { id: "paint-coating", name: "انواع رنگ و پوشش" },
    ],
  },
  {
    id: "safety-rescue-details",
    name: "ایمنی و نجات",
    productGroupIds: ["safety-rescue"],
    subcategories: [
      { id: "life-rafts", name: "انواع قایق‌های لایف رفت" },
      { id: "life-rings-buoys", name: "لایف رینگ‌ها و بویه‌های نجات" },
      { id: "smoke-fire-gas-sensors", name: "انواع حسگرهای دود و آتش و گاز" },
      { id: "tanks", name: "مخازن" },
      { id: "life-jackets", name: "جلیقه‌های نجات" },
      { id: "personal-equipment", name: "انواع تجهیزات انفرادی" },
      { id: "fire-extinguishers", name: "انواع کپسول‌های اطفا حریق ثابت و سیار" },
      { id: "fire-pipes-nozzles", name: "انواع لوله و نازل‌های حریق" },
      { id: "breathing-apparatus-fire-suits", name: "کپسول‌های تنفسی و لباس ضد حریق" },
    ],
  },
  {
    id: "control-monitoring-details",
    name: "سامانه‌های کنترل و مانیتورینگ",
    productGroupIds: ["control-monitoring", "sensors"],
    subcategories: [
      { id: "ecu", name: "ECU" },
      { id: "cpu", name: "CPU" },
      { id: "control-modules", name: "انواع ماژول‌های کنترل" },
      { id: "tank-gauging-loadcom", name: "سامانه‌های سنجش مخازن و محاسبه تعادل، لودکام" },
      { id: "pressure-temperature-rpm-sensors", name: "انواع سنسورهای فشار، دما، دور و نشان‌دهنده‌های چشمی" },
      { id: "hmi", name: "HMI" },
      { id: "control-panels", name: "تابلوهای کنترل" },
    ],
  },
  {
    id: "accommodation-galley-details",
    name: "دکوراتیو، رفاهی و آشپزخانه",
    productGroupIds: ["accommodation-galley"],
    subcategories: [
      { id: "galley-equipment", name: "انواع تجهیزات آشپزخانه" },
      { id: "rice-stew-cookers", name: "دیگ‌های پلوپزی و خورشت‌پز" },
      { id: "ovens", name: "فرها" },
      { id: "grills", name: "کباب‌پزها" },
      { id: "heaters", name: "گرم‌کن‌ها" },
      { id: "beds-cabinets", name: "انواع تجهیزات رفاهی مانند تخت و کمد" },
      { id: "sanitary-equipment", name: "انواع تجهیزات بهداشتی" },
      { id: "entertainment-sports", name: "انواع تجهیزات سرگرمی و ورزشی" },
      { id: "interior-decorations", name: "انواع تزئینات داخلی" },
    ],
  },
  {
    id: "outfitting-details",
    name: "اوت فیتینگ‌ها",
    productGroupIds: ["deck-operations", "other-products"],
    subcategories: [
      { id: "doors-hatches-portholes", name: "انواع درب و هچ و هبله" },
      { id: "stairs-handles-guards", name: "انواع پله و دستگیره و محافظ" },
      { id: "shelves", name: "انواع قفسه" },
      { id: "deck-equipment-eyes", name: "انواع تجهیزات روی دک مانند چشمی‌ها" },
      { id: "deck-fittings-similar", name: "فیتینگ‌های روی دک و موارد مشابه" },
    ],
  },
];

export const detailedSubcategories = detailedSubcategoryGroups.flatMap((group) => group.subcategories);

export function getDetailedSubcategoriesForProductGroup(productGroupId: string) {
  return detailedSubcategoryGroups
    .filter((group) => group.productGroupIds.includes(productGroupId))
    .flatMap((group) => group.subcategories);
}

export const vesselTypes = [
  "لنچ باری",
  "یدک کش دریایی",
  "بارج",
  "دوبه",
  "لندینگ کرافت",
  "سوپالی بوت",
  "شناور و کشتی مسافربری",
  "لنج صیادی",
  "قایق تفریحی",
  "کشتی صنعتی صیادی",
  "کشتی آتشخوار",
  "قایق صیادی",
  "جت اسکی",
  "کروبوت",
  "کشتی باری",
  "سایر شناورها",
];

export const products: Product[] = [
  {
    id: "p-001",
    name: "پمپ سیرکولاسیون آب خنک‌کننده موتور دیزل دریایی MWP-350",
    categoryId: "engine-room",
    productGroupId: "pumps-purifiers",
    subcategoryId: "pumps",
    brand: "Westerbeke",
    model: "MWP-350",
    country: "هلند",
    price: 185_000_000,
    hasPrice: true,
    image: productImages["p-001"],
    gallery: [],
    rating: 4.8,
    reviewCount: 47,
    sellerId: "s-01",
    sellerName: "تأمین قطعات خلیج",
    sellerScore: 4.9,
    stock: 12,
    vesselTypes: ["کشتی باری", "شناور و کشتی مسافربری", "لندینگ کرافت"],
    condition: "new",
    shortDesc: "پمپ آب خنک‌کننده با دبی بالا مناسب برای موتورهای دیزل دریایی",
    description:
      "پمپ آب خنک‌کننده مدل MWP-350 ساخت شرکت Westerbeke هلند، با دبی 350 لیتر بر دقیقه، مناسب برای موتورهای دیزل دریایی تا قدرت 800 اسب بخار. دارای پروانه برنزی مقاوم در برابر خوردگی آب شور، آب‌بند مکانیکی دوبل و بدنه چدنی ضد زنگ.",
    specs: {
      "دبی": "350 لیتر بر دقیقه",
      "فشار کاری": "2.5 بار",
      "جنس پروانه": "برنز دریایی",
      "توان موتور": "تا 800 اسب بخار",
      "ولتاژ": "24 ولت DC",
      "استاندارد": "ISO 8846",
    },
    leadTime: 3,
  },
  {
    id: "p-002",
    name: "دیزل ژنراتور دریایی سه‌فاز 15 کاوا Comar CG-15K",
    categoryId: "electronic",
    productGroupId: "electrical",
    subcategoryId: "generators",
    brand: "Comar",
    model: "CG-15K",
    country: "ایتالیا",
    price: 420_000_000,
    hasPrice: true,
    image: productImages["p-002"],
    gallery: [],
    rating: 4.6,
    reviewCount: 23,
    sellerId: "s-02",
    sellerName: "الکترو مارین پارس",
    sellerScore: 4.7,
    stock: 4,
    vesselTypes: ["کشتی باری", "شناور و کشتی مسافربری"],
    condition: "new",
    shortDesc: "ژنراتور سه‌فاز 15 کاوا با راندمان بالا برای شناورهای تجاری",
    description:
      "ژنراتور سینکرون سه‌فاز 15 کاوا ساخت Comar ایتالیا، مناسب نصب بر روی شناورهای تجاری و مسافری. دارای کلاس حفاظت IP56، عایق‌بندی کلاس H، سیستم AVR داخلی برای تنظیم دقیق ولتاژ و سیستم خنک‌کاری هواخنک.",
    specs: {
      "توان": "15 کاوا / 12 کیلووات",
      "ولتاژ": "400/230 ولت",
      "فرکانس": "50 هرتز",
      "دور": "1500 دور بر دقیقه",
      "کلاس حفاظت": "IP56",
      "عایق": "کلاس H",
    },
    leadTime: 5,
  },
  {
    id: "p-003",
    name: "رادار ناوبری دریایی Furuno NavNet TZtouch3",
    categoryId: "radar-communications",
    productGroupId: "navigation-aids",
    subcategoryId: "radars",
    brand: "Furuno",
    model: "TZT-03",
    country: "ژاپن",
    price: 0,
    hasPrice: false,
    image: productImages["p-003"],
    gallery: [],
    rating: 4.9,
    reviewCount: 18,
    sellerId: "s-03",
    sellerName: "ناوبران دریا",
    sellerScore: 4.95,
    stock: 2,
    vesselTypes: ["کشتی باری", "لنج صیادی", "لندینگ کرافت"],
    condition: "new",
    shortDesc: "رادار پیشرفته با قابلیت تشخیص هدف و اتصال به شبکه ناوبری",
    description:
      "رادار Furuno NAVNET با آنتن 48 اینچ، قابلیت ردیابی تا 128 هدف همزمان، حالت True Trail و True Motion. سازگار با AIS، Plotter و نمایشگر چندگانه. گارانتی رسمی 3 سال.",
    specs: {
      "برد": "تا 72 مایل دریایی",
      "آنتن": "48 اینچ اسلات",
      "توان ارسال": "25 کیلووات",
      "تفکیک‌پذیری": "HD",
      "قابلیت ردیابی": "128 هدف",
      "گارانتی": "3 سال",
    },
    leadTime: 10,
  },
  {
    id: "p-004",
    name: "لنگر دانفورث استیل 45 کیلوگرمی برای عملیات عرشه",
    categoryId: "deck-hull",
    productGroupId: "deck-operations",
    subcategoryId: "deck-fittings-similar",
    brand: "Lewmar",
    model: "Delta-45",
    country: "انگلستان",
    price: 78_500_000,
    hasPrice: true,
    image: productImages["p-004"],
    gallery: [],
    rating: 4.7,
    reviewCount: 62,
    sellerId: "s-01",
    sellerName: "تأمین قطعات خلیج",
    sellerScore: 4.9,
    stock: 8,
    vesselTypes: ["قایق تفریحی", "لنج صیادی", "شناور و کشتی مسافربری"],
    condition: "new",
    shortDesc: "لنگر استیل 316 با طراحی دانفورث، چنگ‌زنی قوی در بسترهای گلی و شنی",
    description:
      "لنگر مدل Delta از جنس استیل 316 دریایی، با طراحی اختصاصی برای چسبندگی فوق‌العاده در بسترهای شنی و گلی. دارای بالانس دقیق و قابلیت استفاده با انواع وینچ و زنجیر.",
    specs: {
      "وزن": "45 کیلوگرم",
      "جنس": "استیل 316",
      "نوع": "دانفورث",
      "طول": "135 سانتی‌متر",
      "کشور سازنده": "انگلستان",
    },
    leadTime: 2,
  },
  {
    id: "p-005",
    name: "کپسول آتش‌نشانی دریایی CO2 ظرفیت 9 کیلوگرم",
    categoryId: "rescue-safety",
    productGroupId: "safety-rescue",
    subcategoryId: "fire-extinguishers",
    brand: "Minimax",
    model: "MX-9CO2",
    country: "آلمان",
    price: 24_900_000,
    hasPrice: true,
    image: productImages["p-005"],
    gallery: [],
    rating: 4.85,
    reviewCount: 34,
    sellerId: "s-04",
    sellerName: "ایمن دریا",
    sellerScore: 4.85,
    stock: 25,
    vesselTypes: ["کشتی باری", "لنج صیادی", "شناور و کشتی مسافربری", "کشتی آتشخوار"],
    condition: "new",
    shortDesc: "کپسول CO2 تأییدیه SOLAS برای موتورخانه و اتاق ماشین",
    description:
      "کپسول آتش‌نشانی CO2 ظرفیت 9 کیلوگرم با تأییدیه SOLAS و MED. مناسب برای موتورخانه و اتاق‌های الکتریکی. دارای شیر اهرمی، فشارسنج و پایه نصب دریایی.",
    specs: {
      "ظرفیت": "9 کیلوگرم",
      "عامل اطفاء": "CO2",
      "برد": "3 متر",
      "تأییدیه": "SOLAS / MED",
      "کشور": "آلمان",
    },
    leadTime: 1,
  },
  {
    id: "p-006",
    name: "توربوشارژر موتور دیزل دریایی MAN B&W مدل 4T-30",
    categoryId: "engine-room",
    productGroupId: "propulsion",
    subcategoryId: "engine",
    brand: "MAN Energy",
    model: "4T-30",
    country: "آلمان",
    price: 0,
    hasPrice: false,
    image: productImages["p-006"],
    gallery: [],
    rating: 4.75,
    reviewCount: 12,
    sellerId: "s-05",
    sellerName: "موتورهای دریایی پارس",
    sellerScore: 4.8,
    stock: 1,
    vesselTypes: ["کشتی باری", "لندینگ کرافت"],
    condition: "refurbished",
    shortDesc: "توربوشارژر بازسازی‌شده با گارانتی برای موتورهای MAN",
    description:
      "توربوشارژر MAN مدل 4T-30 با بازسازی کامل در کارخانه، دارای گارانتی 18 ماه. تست کامل روی دینامومتر قبل از ارسال. مناسب برای موتورهای سری MAN B&W.",
    specs: {
      "مدل": "4T-30",
      "سازگار با": "MAN B&W",
      "وضعیت": "بازسازی کارخانه",
      "گارانتی": "18 ماه",
      "فشار بوست": "2.8 بار",
    },
    leadTime: 21,
  },
  {
    id: "p-007",
    name: "اکوساندر و فیش‌فایندر Garmin Striker Vivid 7dv",
    categoryId: "radar-communications",
    productGroupId: "navigation-aids",
    subcategoryId: "echo-sounder",
    brand: "Garmin",
    model: "Striker Vivid 7dv",
    country: "آمریکا",
    price: 52_000_000,
    hasPrice: true,
    image: productImages["p-007"],
    gallery: [],
    rating: 4.65,
    reviewCount: 89,
    sellerId: "s-03",
    sellerName: "ناوبران دریا",
    sellerScore: 4.95,
    stock: 15,
    vesselTypes: ["قایق صیادی", "لنج صیادی", "قایق تفریحی"],
    condition: "new",
    shortDesc: "سونار ماهی‌یابی رنگی با صفحه 7 اینچ و تکنولوژی Vivid",
    description:
      "سونار ماهی‌یابی Garmin Striker Vivid با صفحه نمایش 7 اینچ، دارای تکنولوژی CLEARVU و SIDESCAN برای دید زیر آب تا عمق 250 متر. GPS داخلی با قابلیت نشانه‌گذاری نقاط.",
    specs: {
      "صفحه": "7 اینچ WVGA",
      "عمق": "تا 250 متر",
      "تکنولوژی": "CLEARVU + SIDESCAN",
      "GPS": "داخلی",
      "توان ارسال": "500 وات RMS",
    },
    leadTime: 2,
  },
  {
    id: "p-008",
    name: "باتری دریایی سیلد 200 آمپرساعت Varta Marine",
    categoryId: "electronic",
    productGroupId: "electrical",
    subcategoryId: "ups",
    brand: "Varta",
    model: "Marine-200",
    country: "آلمان",
    price: 31_800_000,
    hasPrice: true,
    image: productImages["p-008"],
    gallery: [],
    rating: 4.55,
    reviewCount: 128,
    sellerId: "s-02",
    sellerName: "الکترو مارین پارس",
    sellerScore: 4.7,
    stock: 40,
    vesselTypes: ["قایق تفریحی", "لنج صیادی", "شناور و کشتی مسافربری"],
    condition: "new",
    shortDesc: "باتری خشک بدون نگهداری 200 آمپر مقاوم در برابر لرزش دریایی",
    description:
      "باتری دریایی خشک Varta با ظرفیت 200 آمپر ساعت، فناوری AGM برای عملکرد عالی در شرایط دریایی. مقاوم در برابر لرزش، بدون نیاز به نگهداری، طول عمر بالا.",
    specs: {
      "ظرفیت": "200 آمپر ساعت",
      "ولتاژ": "12 ولت",
      "فناوری": "AGM",
      "وزن": "48 کیلوگرم",
      "طول عمر": "تا 8 سال",
    },
    leadTime: 1,
  },
  {
    id: "p-009",
    name: "پمپ فشارقوی سوخت دیزل دریایی Bosch CP4-M",
    categoryId: "engine-room",
    productGroupId: "pumps-purifiers",
    subcategoryId: "pumps",
    brand: "Bosch",
    model: "CP4-M",
    country: "آلمان",
    price: 142_000_000,
    hasPrice: true,
    image: productImages["p-009"],
    gallery: [],
    rating: 4.8,
    reviewCount: 27,
    sellerId: "s-05",
    sellerName: "موتورهای دریایی پارس",
    sellerScore: 4.8,
    stock: 6,
    vesselTypes: ["کشتی باری", "لندینگ کرافت"],
    condition: "new",
    shortDesc: "پمپ فشارقوی سوخت دیزل برای موتورهای دریایی مدرن",
    description:
      "پمپ سوخت فشارقوی Bosch CP4-M برای موتورهای دیزل دریایی Common Rail. فشار کاری تا 1800 بار، دبی بالا و سازگاری با سوخت‌های استاندارد IMO.",
    specs: {
      "فشار کاری": "تا 1800 بار",
      "نوع سوخت": "دیزل IMO",
      "سازگار": "Common Rail",
      "جنس بدنه": "آلیاژ آلومینیوم",
    },
    leadTime: 7,
  },
  {
    id: "p-010",
    name: "جلیقه نجات دریایی SOLAS با نوار بازتابنده",
    categoryId: "rescue-safety",
    productGroupId: "safety-rescue",
    subcategoryId: "life-jackets",
    brand: "Lalizas",
    model: "SOLAS-7501",
    country: "یونان",
    price: 4_200_000,
    hasPrice: true,
    image: productImages["p-010"],
    gallery: [],
    rating: 4.7,
    reviewCount: 56,
    sellerId: "s-04",
    sellerName: "ایمن دریا",
    sellerScore: 4.85,
    stock: 120,
    vesselTypes: ["کشتی باری", "شناور و کشتی مسافربری", "لنج صیادی", "قایق صیادی"],
    condition: "new",
    shortDesc: "جلیقه نجات با شناوری 275 نیوتن تأییدیه SOLAS",
    description:
      "جلیقه نجات دریایی Lalizas با شناوری 275 نیوتن، مناسب آب‌های آزاد و شرایط بحرانی. دارای سوت، چراغ LED، نوار بازتابنده و تأییدیه SOLAS.",
    specs: {
      "شناوری": "275 نیوتن",
      "تأییدیه": "SOLAS",
      "جنس": "نایلون ضدآب",
      "رنگ": "نارنجی",
      "سایز": "بزرگسال",
    },
    leadTime: 1,
  },
  {
    id: "p-011",
    name: "گیربکس کاهنده دریایی Twin Disc MG-518",
    categoryId: "engine-room",
    productGroupId: "propulsion",
    subcategoryId: "gearbox",
    brand: "Twin Disc",
    model: "MG-518",
    country: "آمریکا",
    price: 0,
    hasPrice: false,
    image: productImages["p-011"],
    gallery: [],
    rating: 4.6,
    reviewCount: 9,
    sellerId: "s-05",
    sellerName: "موتورهای دریایی پارس",
    sellerScore: 4.8,
    stock: 2,
    vesselTypes: ["کشتی باری", "لنج صیادی", "لندینگ کرافت"],
    condition: "new",
    shortDesc: "گیربکس دریایی با نسبت تبدیل متغیر برای موتورهای 500-1200 اسب بخار",
    description:
      "گیربکس دریایی Twin Disc مدل MG-518 با قابلیت کنترل الکتروهیدرولیک، مناسب موتورهای دیزل دریایی با قدرت 500 تا 1200 اسب بخار. دارای نسبت تبدیل‌های 2.04:1 تا 5.0:1",
    specs: {
      "مدل": "MG-518",
      "قدرت موتور": "500-1200 اسب بخار",
      "نسبت تبدیل": "2.04:1 تا 5.0:1",
      "کنترل": "الکتروهیدرولیک",
    },
    leadTime: 30,
  },
  {
    id: "p-012",
    name: "رنگ ضدخزه و ضدخوردگی بدنه شناور Jotun SeaForce",
    categoryId: "deck-hull",
    productGroupId: "rope-oil-grease-paint",
    subcategoryId: "paint-coating",
    brand: "Jotun",
    model: "BallastCheck-HB",
    country: "نروژ",
    price: 8_900_000,
    hasPrice: true,
    image: productImages["p-012"],
    gallery: [],
    rating: 4.75,
    reviewCount: 41,
    sellerId: "s-01",
    sellerName: "تأمین قطعات خلیج",
    sellerScore: 4.9,
    stock: 60,
    vesselTypes: ["کشتی باری", "شناور و کشتی مسافربری", "لنج صیادی", "بارج"],
    condition: "new",
    shortDesc: "پوشش ضدخوردگی اپوکسی دو جزئی مخصوص بدنه و مخازن",
    description:
      "رنگ اپوکسی دو جزئی Jotun BallastCheck HB با مقاومت عالی در برابر خوردگی آب شور و مواد شیمیایی. مناسب برای بدنه زیر آب، مخازن سوخت و آب.",
    specs: {
      "نوع": "اپوکسی دو جزئی",
      "حجم": "20 لیتر",
      "ضخامت خشک": "125 میکرون",
      "مقاومت حرارتی": "تا 120 درجه",
      "رنگ": "قرمز آجری",
    },
    leadTime: 2,
  },
];

const legacyCategoryMap: Record<string, { categoryId: string; productGroupId: string; subcategoryId?: string }> = {
  engine: { categoryId: "engine-room", productGroupId: "propulsion", subcategoryId: "engine" },
  electric: { categoryId: "electronic", productGroupId: "electrical" },
  hull: { categoryId: "deck-hull", productGroupId: "deck-operations", subcategoryId: "deck-fittings-similar" },
  navigation: { categoryId: "radar-communications", productGroupId: "navigation-aids", subcategoryId: "radars" },
  safety: { categoryId: "rescue-safety", productGroupId: "safety-rescue", subcategoryId: "personal-equipment" },
  fuel: { categoryId: "engine-room", productGroupId: "pumps-purifiers", subcategoryId: "pumps" },
};

const legacyVesselMap: Record<string, string> = {
  "صیادی": "لنج صیادی",
  "تجاری": "کشتی باری",
  "مسافری": "شناور و کشتی مسافربری",
  "نفتکش": "کشتی باری",
  "یدککش": "یدک کش دریایی",
  "تفریحی": "قایق تفریحی",
};

export function normalizeProductTaxonomy(product: Product): Product {
  const validCategory = categories.some((category) => category.id === product.categoryId);
  const mappedCategory = legacyCategoryMap[product.categoryId];
  const normalizedCategoryId = validCategory
    ? product.categoryId
    : mappedCategory?.categoryId || "other-marine-equipment";
  const normalizedProductGroupId =
    product.productGroupId && productGroups.some((group) => group.id === product.productGroupId)
      ? product.productGroupId
      : mappedCategory?.productGroupId || product.productGroupId || "other-products";
  const nextVesselTypes = product.vesselTypes
    .map((vessel) => legacyVesselMap[vessel] || vessel)
    .filter((vessel, index, all) => vesselTypes.includes(vessel) && all.indexOf(vessel) === index);

  return {
    ...product,
    image: normalizeImage(product.image, product.name, normalizedCategoryId, product.id),
    ...(validCategory
      ? {}
      : mappedCategory || { categoryId: "other-marine-equipment", productGroupId: "other-products" }),
    categoryId: getCategoryIdForProductGroup(normalizedProductGroupId),
    productGroupId: normalizedProductGroupId,
    subcategoryId:
      product.subcategoryId && detailedSubcategories.some((subcategory) => subcategory.id === product.subcategoryId)
        ? product.subcategoryId
        : mappedCategory?.subcategoryId || "",
    vesselTypes: nextVesselTypes.length > 0 ? nextVesselTypes : ["سایر شناورها"],
  };
}

export const sellers = [
  { id: "s-01", name: "تأمین قطعات خلیج", rating: 4.9, verified: true, location: "بندرعباس" },
  { id: "s-02", name: "الکترو مارین پارس", rating: 4.7, verified: true, location: "بوشهر" },
  { id: "s-03", name: "ناوبران دریا", rating: 4.95, verified: true, location: "تهران" },
  { id: "s-04", name: "ایمن دریا", rating: 4.85, verified: true, location: "انزلی" },
  { id: "s-05", name: "موتورهای دریایی پارس", rating: 4.8, verified: true, location: "خرمشهر" },
];

export function formatPrice(price: number): string {
  if (price === 0) return "نیازمند استعلام";
  return price.toLocaleString("fa-IR") + " ریال";
}

export function formatPriceToman(price: number): string {
  if (price === 0) return "نیازمند استعلام";
  return Math.round(price / 10).toLocaleString("fa-IR") + " تومان";
}
