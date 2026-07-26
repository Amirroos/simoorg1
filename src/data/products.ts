import {
  catalogVisualFamily,
  getSheetCatalogGroupId,
  getSheetCatalogSubgroupId,
  mapSheetGroupToLegacyProductGroup,
  sheetCatalogRecords,
  type SheetCatalogRecord,
} from "./sheetCatalog";

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
  status?: "published" | "draft" | "pending" | "rejected";
  workflowType?: "seed" | "supplier_offer" | "admin_request_offer";
  adminRequestId?: string;
  supplierBasePrice?: number;
  adminProfitPercent?: number;
  approvedAt?: string;
  submittedAt?: string;
  supplierOfferNote?: string;
  createdAt?: string;
  catalogGroupId?: string;
  catalogGroupName?: string;
  catalogSubgroupId?: string;
  catalogSubgroupName?: string;
  catalogCategory?: string;
  catalogCategoryEn?: string;
  catalogSource?: string;
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

const generatedCatalogPhotos: Record<string, string> = {
  engine: "/media/catalog-generated/engine.jpg",
  "engine-parts": "/media/catalog-generated/engine-parts.jpg",
  gear: "/media/catalog-generated/gear.jpg",
  propulsion: "/media/catalog-generated/propulsion.jpg",
  pump: "/media/catalog-generated/pump.jpg",
  filter: "/media/catalog-generated/filter.jpg",
  valve: "/media/catalog-generated/valve.jpg",
  radar: "/media/catalog-generated/radar.jpg",
  radio: "/media/catalog-generated/radio.jpg",
  electrical: "/media/catalog-generated/electrical.jpg",
  battery: "/media/catalog-generated/battery.jpg",
  switchgear: "/media/catalog-generated/switchgear.jpg",
  safety: "/media/catalog-generated/safety.jpg",
  deck: "/media/catalog-generated/deck.jpg",
  mooring: "/media/catalog-generated/mooring.jpg",
  hvac: "/media/catalog-generated/hvac.jpg",
  hydraulic: "/media/catalog-generated/hydraulic.jpg",
  material: "/media/catalog-generated/material.jpg",
  galley: "/media/catalog-generated/galley.jpg",
  accommodation: "/media/catalog-generated/accommodation.jpg",
  tool: "/media/catalog-generated/tool.jpg",
  environment: "/media/catalog-generated/environment.jpg",
  control: "/media/catalog-generated/control.jpg",
  hull: "/media/catalog-generated/hull.jpg",
  computing: "/media/catalog-generated/computing.jpg",
  marine: "/media/catalog-generated/marine.jpg",
  navigation: "/media/catalog-generated/radar.jpg",
  fishing: "/media/catalog-generated/marine.jpg",
  paint: "/media/catalog-generated/material.jpg",
  default: "/media/catalog-generated/marine.jpg",
};

export function marineImage(title: string, kind: keyof typeof imagePalettes = "default") {
  const generatedPhoto = generatedCatalogPhotos[kind] || generatedCatalogPhotos.default;
  if (generatedPhoto) return generatedPhoto;

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

const catalogArtworkCache = new Map<string, string>();
const catalogArtworkPalettes: Array<[string, string, string]> = [
  ["#0e7490", "#082f49", "#67e8f9"],
  ["#1d4ed8", "#172554", "#93c5fd"],
  ["#0f766e", "#042f2e", "#5eead4"],
  ["#7c3aed", "#2e1065", "#c4b5fd"],
  ["#b45309", "#451a03", "#fcd34d"],
  ["#be123c", "#4c0519", "#fda4af"],
  ["#475569", "#0f172a", "#cbd5e1"],
];

function catalogArtworkShape(family: string, accent: string) {
  const common = `fill="none" stroke="#f8fafc" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"`;
  const accented = `fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"`;

  const shapes: Record<string, string> = {
    engine: `<rect x="350" y="245" width="500" height="300" rx="58" ${common}/><path d="M430 245v-80h120v80m100 0v-80h120v80M320 390h-95m750 0h-95M450 545v80m300-80v80" ${accented}/><circle cx="470" cy="390" r="62" ${common}/><circle cx="730" cy="390" r="62" ${common}/><path d="M532 390h136" ${accented}/>`,
    gear: `<circle cx="600" cy="390" r="185" ${common}/><circle cx="600" cy="390" r="72" ${accented}/><path d="M600 160v80m0 300v80M370 390h80m300 0h80M438 228l56 56m212 212 56 56m0-324-56 56M494 496l-56 56" ${common}/>`,
    pump: `<circle cx="560" cy="390" r="175" ${common}/><circle cx="560" cy="390" r="58" ${accented}/><path d="M735 390h190v-115M385 390H235v125M560 332l86-50m-86 108 95 55m-95-55-5 110" ${common}/>`,
    valve: `<path d="M180 390h285m270 0h285M465 255l270 270V255L465 525Z" ${common}/><path d="M600 255V150m-95 0h190" ${accented}/><circle cx="600" cy="390" r="48" ${accented}/>`,
    radar: `<circle cx="600" cy="390" r="220" ${common}/><circle cx="600" cy="390" r="135" ${accented}/><circle cx="600" cy="390" r="42" fill="${accent}"/><path d="M600 390l150-150M380 390h440M600 170v440" ${common}/><path d="M730 285a165 165 0 0 1 20 195" ${accented}/>`,
    radio: `<path d="M600 590V300m-110 290h220M600 300l-70 90h140Z" ${common}/><path d="M460 270a190 190 0 0 0 0 240m280-240a190 190 0 0 1 0 240M385 205a285 285 0 0 0 0 370m430-370a285 285 0 0 1 0 370" ${accented}/>`,
    electrical: `<rect x="345" y="240" width="510" height="315" rx="44" ${common}/><path d="M470 240v-65h80v65m100 0v-65h80v65M465 390h95m-48-48v96m165-48h95" ${accented}/><path d="M610 280l-70 130h75l-35 100 105-155h-78l40-75Z" fill="${accent}"/>`,
    safety: `<circle cx="600" cy="390" r="210" ${common}/><circle cx="600" cy="390" r="95" ${common}/><path d="M452 242l82 82m132 132 82 82m0-296-82 82M534 456l-82 82" ${accented}/>`,
    deck: `<path d="M600 160v420M450 270h300M390 470c40 115 110 165 210 165s170-50 210-165M390 470l-95 35m515-35 95 35" ${common}/><circle cx="600" cy="205" r="46" ${accented}/>`,
    hvac: `<circle cx="600" cy="390" r="225" ${common}/><circle cx="600" cy="390" r="44" fill="${accent}"/><path d="M600 346c-12-135 45-170 135-145 20 95-30 150-135 189m44 0c135-12 170 45 145 135-95 20-150-30-189-135m0 44c12 135-45 170-135 145-20-95 30-150 135-189m-44 0c-135 12-170-45-145-135 95-20 150 30 189 135" ${accented}/>`,
    hydraulic: `<rect x="270" y="320" width="380" height="145" rx="35" ${common}/><path d="M650 390h285M770 320v140M270 390H155" ${accented}/><circle cx="220" cy="390" r="54" ${common}/><circle cx="980" cy="390" r="54" ${common}/>`,
    material: `<path d="M410 270h380l-35 320H445L410 270Z" ${common}/><path d="M450 270v-75h300v75M495 390h210" ${accented}/><path d="M600 315c-55 70-72 105-72 145a72 72 0 0 0 144 0c0-40-17-75-72-145Z" fill="${accent}"/>`,
    galley: `<rect x="330" y="245" width="540" height="320" rx="42" ${common}/><circle cx="470" cy="355" r="62" ${accented}/><circle cx="690" cy="355" r="62" ${accented}/><path d="M420 500h360M815 300v200" ${common}/>`,
    tool: `<path d="M420 555l305-305c-28-70-12-125 48-172l18 105 105 18c-47 60-102 76-172 48L420 555Z" ${common}/><circle cx="385" cy="590" r="75" ${accented}/>`,
    environment: `<rect x="360" y="220" width="480" height="350" rx="64" ${common}/><path d="M430 220v-65h340v65M500 325c55-70 145-70 200 0m-210 95 110 95 110-95" ${accented}/><circle cx="505" cy="350" r="28" fill="${accent}"/><circle cx="695" cy="350" r="28" fill="${accent}"/>`,
    control: `<rect x="320" y="215" width="560" height="350" rx="54" ${common}/><circle cx="500" cy="380" r="105" ${accented}/><path d="M500 380l62-62M685 315h105m-105 80h105m-105 80h70" ${common}/>`,
    marine: `<rect x="345" y="235" width="510" height="335" rx="48" ${common}/><path d="M430 320h340M430 410h220M430 500h280" ${accented}/><circle cx="790" cy="410" r="50" ${common}/>`,
  };

  return shapes[family] || shapes.marine;
}

function buildCatalogArtwork(product: Pick<Product, "id" | "name" | "model" | "brand" | "image" | "catalogCategoryEn">) {
  const [, family = "marine"] = product.image.split(":");
  let hash = 0;
  for (let index = 0; index < product.id.length; index += 1) {
    hash = (hash * 31 + product.id.charCodeAt(index)) >>> 0;
  }
  const [primary, dark, accent] = catalogArtworkPalettes[hash % catalogArtworkPalettes.length];
  const safeTitle = product.name.replace(/[&<>]/g, "").slice(0, 44);
  const safeBrand = product.brand.replace(/[&<>]/g, "").slice(0, 28);
  const safeModel = product.model.replace(/[&<>]/g, "").slice(0, 38);
  const safeEnglish = (product.catalogCategoryEn || family).replace(/[&<>]/g, "").slice(0, 52);
  const shape = catalogArtworkShape(family, accent);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="catalog-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="0.62" stop-color="${dark}"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
        <pattern id="catalog-grid" width="54" height="54" patternUnits="userSpaceOnUse">
          <path d="M54 0H0V54" fill="none" stroke="#fff" stroke-opacity=".055"/>
        </pattern>
      </defs>
      <rect width="1200" height="900" fill="url(#catalog-bg)"/>
      <rect width="1200" height="900" fill="url(#catalog-grid)"/>
      <circle cx="180" cy="130" r="250" fill="${accent}" opacity=".12"/>
      <circle cx="1030" cy="610" r="300" fill="${primary}" opacity=".22"/>
      <g>${shape}</g>
      <rect x="90" y="690" width="1020" height="138" rx="34" fill="#020617" opacity=".72" stroke="#fff" stroke-opacity=".16"/>
      <text x="600" y="744" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma, Arial" font-size="36" font-weight="800" fill="#fff">${safeTitle}</text>
      <text x="600" y="790" text-anchor="middle" font-family="Arial, Tahoma" font-size="23" font-weight="700" fill="${accent}">${safeBrand} · ${safeModel}</text>
      <text x="600" y="865" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" letter-spacing="3" fill="#cbd5e1">${safeEnglish}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getProductImageSource(product: Pick<Product, "id" | "name" | "model" | "brand" | "image" | "catalogCategoryEn">) {
  if (!product.image.startsWith("catalog-art:") && !product.image.startsWith("catalog-photo:")) {
    return product.image;
  }

  const [, family = "marine"] = product.image.split(":");
  return generatedCatalogPhotos[family] || generatedCatalogPhotos.marine;
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
  "p-001": generatedCatalogPhotos.pump,
  "p-002": generatedCatalogPhotos.electrical,
  "p-003": generatedCatalogPhotos.radar,
  "p-004": generatedCatalogPhotos.deck,
  "p-005": generatedCatalogPhotos.safety,
  "p-006": generatedCatalogPhotos["engine-parts"],
  "p-007": generatedCatalogPhotos.radar,
  "p-008": generatedCatalogPhotos.battery,
  "p-009": generatedCatalogPhotos.pump,
  "p-010": generatedCatalogPhotos.safety,
  "p-011": generatedCatalogPhotos.gear,
  "p-012": generatedCatalogPhotos.material,
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
  { id: "pumps-purifiers", name: "پمپ‌ها و تصفیه‌کننده‌ها", icon: "RefreshCw", image: generatedCatalogPhotos.pump, categoryId: "engine-room" },
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

const featuredProducts: Product[] = [
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

const mockSellers = [
  { id: "s-01", name: "تأمین قطعات خلیج", score: 4.9 },
  { id: "s-02", name: "الکترو مارین پارس", score: 4.7 },
  { id: "s-03", name: "ناوبران دریا", score: 4.95 },
  { id: "s-04", name: "ایمن دریا", score: 4.85 },
  { id: "s-05", name: "موتورهای دریایی پارس", score: 4.8 },
];

function buildSheetProduct(record: SheetCatalogRecord, index: number, suffix = ""): Product {
  const productGroupId = mapSheetGroupToLegacyProductGroup(record.group);
  const availableSubcategories = getDetailedSubcategoriesForProductGroup(productGroupId);
  const seller = mockSellers[index % mockSellers.length];
  const catalogGroupId = getSheetCatalogGroupId(record);
  const catalogSubgroupId = getSheetCatalogSubgroupId(record);
  const condition: Product["condition"] = index % 17 === 0 ? "refurbished" : index % 29 === 0 ? "used" : "new";
  const identity = suffix ? `${record.id}-${suffix}` : record.id;

  return {
    id: `catalog-${identity}`,
    name: record.category,
    categoryId: getCategoryIdForProductGroup(productGroupId),
    productGroupId,
    subcategoryId: availableSubcategories[index % Math.max(1, availableSubcategories.length)]?.id || "",
    brand: record.brand,
    model: record.model,
    country: record.country || "نامشخص",
    price: 24_000_000 + (index % 37) * 6_750_000,
    hasPrice: index % 13 !== 0,
    image: `catalog-photo:${catalogVisualFamily(record)}:${identity}`,
    gallery: [],
    rating: Math.round((4.1 + (index % 9) / 10) * 10) / 10,
    reviewCount: 4 + (index % 48),
    sellerId: seller.id,
    sellerName: seller.name,
    sellerScore: seller.score,
    stock: 3 + (index % 12) * 5,
    vesselTypes: [
      vesselTypes[index % (vesselTypes.length - 1)],
      vesselTypes[(index + 5) % (vesselTypes.length - 1)],
    ],
    condition,
    shortDesc: `${record.category} برند ${record.brand}، مدل ${record.model}`,
    description: `${record.category} از گروه ${record.group} و زیرگروه ${record.subgroup}. اطلاعات برند، مدل و کشور سازنده مستقیماً از فایل مرجع کاتالوگ بارگذاری شده است.`,
    specs: {
      "گروه اصلی": record.group,
      زیرگروه: record.subgroup,
      "نوع کالا": record.category,
      برند: record.brand,
      "مدل / خانواده محصول": record.model,
      "کشور سازنده": record.country || "نامشخص",
    },
    leadTime: 1 + (index % 9),
    tags: [record.group, record.subgroup, record.category, record.brand, record.model],
    status: "published",
    workflowType: "seed",
    createdAt: new Date(2026, index % 6, (index % 27) + 1).toISOString(),
    catalogGroupId,
    catalogGroupName: record.group,
    catalogSubgroupId,
    catalogSubgroupName: record.subgroup,
    catalogCategory: record.category,
    catalogCategoryEn: record.categoryEn,
    catalogSource: record.source,
  };
}

function buildMockCatalog(): Product[] {
  const catalog = sheetCatalogRecords.map((record, index) => buildSheetProduct(record, index));
  const subgroupRecords = new Map<string, SheetCatalogRecord[]>();

  sheetCatalogRecords.forEach((record) => {
    const key = getSheetCatalogSubgroupId(record);
    subgroupRecords.set(key, [...(subgroupRecords.get(key) || []), record]);
  });

  subgroupRecords.forEach((records, subgroupId) => {
    const currentCount = catalog.filter((product) => product.catalogSubgroupId === subgroupId).length;
    for (let index = currentCount; index < 10; index += 1) {
      const sourceRecord = records[index % records.length];
      catalog.push(buildSheetProduct(sourceRecord, catalog.length, `supplement-${index + 1}`));
    }
  });

  return catalog;
}

export const mockProducts = buildMockCatalog();
export const products: Product[] = [...featuredProducts, ...mockProducts];

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
    status: product.status || "published",
    workflowType: product.workflowType || "seed",
    supplierBasePrice: product.supplierBasePrice ?? product.price,
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
