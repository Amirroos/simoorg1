import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = join(rootDir, "dist");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const model = process.env.OPENROUTER_MODEL || "openrouter/free";
const fallbackEnabled = process.env.DARYA_YAR_FALLBACK !== "0";
const minResponseMs = Number(process.env.DARYA_YAR_MIN_RESPONSE_MS || 1000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function withMinimumDelay(startedAt, action) {
  const payload = await action();
  const elapsed = Date.now() - startedAt;
  if (elapsed < minResponseMs) await delay(minResponseMs - elapsed);
  return payload;
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 15_000_000) {
        reject(new Error("درخواست بیش از حد بزرگ است."));
        req.pause();
      }
    });
    req.on("end", () => resolveBody(body));
    req.on("error", reject);
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders(),
  });
  res.end(JSON.stringify(payload));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conditionLabel(condition) {
  if (condition === "new") return "نو";
  if (condition === "used") return "کارکرده / دست دوم";
  if (condition === "refurbished") return "بازسازی شده";
  return "نامشخص";
}

function specsText(specs) {
  if (!specs) return "";
  if (Array.isArray(specs)) return specs.map((item) => `${item.key || ""} ${item.value || ""}`).join(" ");
  if (typeof specs === "object") return Object.entries(specs).map(([key, value]) => `${key} ${value}`).join(" ");
  return String(specs);
}

function productText(product) {
  return normalize([
    product?.name,
    product?.brand,
    product?.model,
    product?.country,
    product?.group,
    product?.productGroupId,
    product?.subcategoryId,
    conditionLabel(product?.condition),
    product?.condition,
    product?.shortDesc,
    product?.description,
    product?.leadTime,
    Array.isArray(product?.tags) ? product.tags.join(" ") : "",
    Array.isArray(product?.vesselTypes) ? product.vesselTypes.join(" ") : "",
    specsText(product?.specs),
  ].join(" "));
}

function userMessages(messages) {
  return (messages || []).filter((message) => message?.role !== "assistant");
}

function conversationText(messages) {
  return normalize(userMessages(messages).map((message) => message.content).join(" "));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(normalize(word)));
}

function extractTerms(text) {
  const stopWords = new Set([
    "برای",
    "میشه",
    "میخواهم",
    "میخام",
    "میخوام",
    "نیاز",
    "دارم",
    "دنبال",
    "لطفا",
    "محصول",
    "قطعه",
    "کالا",
  ]);
  return [...new Set(text.split(/\s+/).filter((term) => term.length > 2 && !stopWords.has(term)))];
}

function getKnownBrands(products) {
  return [...new Set(products.map((product) => normalize(product.brand)).filter(Boolean))];
}

function getKnownModels(products) {
  return [...new Set(products.map((product) => normalize(product.model)).filter(Boolean))];
}

function getKnownGroups(products) {
  return [...new Set(products.flatMap((product) => [
    normalize(product.group),
    normalize(product.productGroupId),
    normalize(product.subcategoryId),
  ]).filter(Boolean))];
}

function getKnownCountries(products) {
  return [...new Set(products.map((product) => normalize(product.country)).filter(Boolean))];
}

function getKnownTags(products) {
  return [...new Set(products.flatMap((product) => Array.isArray(product.tags) ? product.tags.map(normalize) : []).filter(Boolean))];
}

function analyzeConversation(messages, products) {
  const text = conversationText(messages);
  const brands = getKnownBrands(products);
  const models = getKnownModels(products);
  const groups = getKnownGroups(products);
  const countries = getKnownCountries(products);
  const tags = getKnownTags(products);
  const hasGroup = groups.some((group) => group && text.includes(group)) ||
    hasAny(text, ["گروه محصول", "دسته محصول", "موتورخانه", "برق دریایی", "ناوبری", "ایمنی", "عرشه", "سکان", "بدنه"]);
  const hasBrand = brands.some((brand) => brand && text.includes(brand));
  const hasModel = models.some((modelName) => modelName && text.includes(modelName));
  const hasModelLikeToken = /(?:^|\s)[a-z]{1,}[-.\w]*\d[\w.-]*(?:\s|$)|(?:^|\s)\d[\w.-]*[a-z][\w.-]*(?:\s|$)/i.test(text);
  const hasUnknownModelMention = hasModelLikeToken && !hasModel;
  const hasCondition = hasAny(text, ["نو", "جدید", "دست دوم", "دسته دوم", "کارکرده", "بازسازی", "refurbished", "used", "new"]);
  const hasVessel = products.some((product) => (product.vesselTypes || []).some((vessel) => text.includes(normalize(vessel)))) ||
    hasAny(text, ["باری", "صیادی", "نفتکش", "تجاری", "تفریحی", "لنج", "یدک کش", "مسافری"]);
  const hasCountry = countries.some((country) => country && text.includes(country)) ||
    hasAny(text, ["ایران", "چین", "ژاپن", "کره", "آلمان", "ترکیه", "ایتالیا", "آمریکا", "انگلیس", "فرانسه", "هلند", "سوئد", "نروژ"]);
  const hasStockPreference = hasAny(text, ["موجود", "ناموجود", "فوری", "آماده ارسال", "انبار", "استعلامی", "هر موجودی"]);
  const hasLeadTimePreference = hasAny(text, ["فوری", "آماده سازی", "آماده‌سازی", "تحویل", "ارسال", "روز", "هفته", "ماه", "زمان"]);
  const meaningfulTags = tags.filter((tag) => !["موتور", "دریایی", "قطعه", "کالا"].includes(tag));
  const hasTags = hasAny(text, ["تگ", "کاربرد", "برای مصرف", "مورد استفاده"]) ||
    meaningfulTags.some((tag) => tag && text.includes(tag)) ||
    hasAny(text, ["خنک کننده", "خنک‌کننده", "برق", "ایمنی", "ناوبری", "سوخت", "یدکی", "اصلی", "جایگزین", "سنگین", "سبک"]);
  const hasTechnicalSpec = /\d/.test(text) || hasAny(text, [
    "توان",
    "دبی",
    "ولتاژ",
    "آمپر",
    "اسب",
    "کیلووات",
    "لیتر",
    "بار",
    "اینچ",
    "قطر",
    "طول",
    "ظرفیت",
    "rpm",
    "kw",
    "hp",
    "v",
  ]);
  const turnCount = userMessages(messages).length;

  return {
    text,
    turnCount,
    hasGroup,
    hasBrand,
    hasModel,
    hasUnknownModelMention,
    hasCondition,
    hasVessel,
    hasCountry,
    hasStockPreference,
    hasTechnicalSpec,
    hasTags,
    hasLeadTimePreference,
    detailCount: [hasGroup, hasBrand, hasModel, hasCountry, hasCondition, hasVessel, hasStockPreference, hasTechnicalSpec, hasTags, hasLeadTimePreference].filter(Boolean).length,
  };
}

function scoreProducts(text, products) {
  const terms = extractTerms(text);
  return products
    .map((product) => {
      const haystack = productText(product);
      const brand = normalize(product.brand);
      const modelName = normalize(product.model);
      const condition = normalize(`${product.condition} ${conditionLabel(product.condition)}`);
      const vesselText = normalize((product.vesselTypes || []).join(" "));

      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += term.length <= 4 ? 1 : 1.6;
      }
      if (brand && text.includes(brand)) score += 5;
      if (modelName && text.includes(modelName)) score += 7;
      if (condition && condition.split(" ").some((part) => part.length > 1 && text.includes(part))) score += 1.5;
      if (vesselText && vesselText.split(" ").some((part) => part.length > 2 && text.includes(part))) score += 2;
      if (Number(product.stock || 0) > 0) score += 0.35;
      if (product.hasPrice) score += 0.15;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score);
}

function questionForMissingFields(analysis, scored) {
  const best = scored[0]?.product;
  const questions = [];

  if (!analysis.hasGroup) {
    questions.push("گروه محصول چیست؟ مثلا موتورخانه، برق دریایی، ناوبری، ایمنی یا عرشه.");
  }
  if (!analysis.hasVessel) {
    questions.push("نوع شناور چیست؟ مثلا باری، صیادی، تفریحی یا تجاری.");
  }
  if (!analysis.hasBrand) {
    questions.push("برند مدنظر یا برند دستگاه فعلی چیست؟");
  }
  if (!analysis.hasModel) {
    questions.push("مدل دقیق دستگاه یا قطعه چیست؟");
  }
  if (!analysis.hasCountry) {
    questions.push("کشور سازنده یا کشور مورد قبول برای شما چیست؟");
  }
  if (!analysis.hasCondition) {
    questions.push("کالا را نو می‌خواهید، کارکرده، یا بازسازی‌شده هم قابل قبول است؟");
  }
  if (!analysis.hasStockPreference) {
    questions.push("موجودی برایتان مهم است؟ فقط موجود در انبار می‌خواهید یا استعلامی هم قابل قبول است؟");
  }
  if (!analysis.hasTechnicalSpec) {
    questions.push("یک مشخصه فنی مهم مثل توان، دبی، ولتاژ، سایز یا ظرفیت را بفرستید.");
  }
  if (!analysis.hasTags) {
    questions.push("کاربرد یا تگ‌های مهم را بگویید؛ مثلا خنک‌کننده، یدکی، اصلی، برق، ایمنی یا ناوبری.");
  }
  if (!analysis.hasLeadTimePreference) {
    questions.push("زمان آماده‌سازی یا تحویل قابل قبول چقدر است؟ مثلا فوری، چند روز یا چند هفته.");
  }

  const nextQuestion = questions[0] || "اگر نکته فنی دیگری دارید بفرستید تا مقایسه دقیق‌تر شود.";

  if (best) {
    return [
      "با اطلاعات فعلی، نزدیک‌ترین گزینه‌ای که در محصولات پیدا کردم این است:",
      productLine(best),
      "این هنوز پیشنهاد نهایی نیست؛ برای دقیق‌تر شدن فقط این مورد را مشخص کنید:",
      nextQuestion,
    ].join("\n");
  }

  return [
    "برای اینکه محصول اشتباه پیشنهاد ندهم، هنوز یک مشخصه لازم دارم.",
    nextQuestion,
  ].join("\n");
}

function productLine(product) {
  const priceText = product.priceText || (product.hasPrice && product.price ? `${product.price} تومان` : "قیمت: استعلامی");
  const stockText = Number(product.stock || 0) > 0 ? `موجودی: ${product.stock}` : "فعلا ناموجود یا بدون موجودی ثبت‌شده";
  return [
    `نام: ${product.name}`,
    product.brand ? `برند: ${product.brand}` : "",
    product.model ? `مدل: ${product.model}` : "",
    `وضعیت: ${conditionLabel(product.condition)}`,
    priceText,
    stockText,
    product.leadTime ? `زمان آماده‌سازی: ${product.leadTime} روز` : "",
  ].filter(Boolean).join(" | ");
}

function buildLocalDecision(messages, products) {
  const catalog = Array.isArray(products) ? products : [];
  const analysis = analyzeConversation(messages, catalog);

  if (!analysis.text) {
    return {
      status: "needs_info",
      reply: "نیاز فنی یا قطعه مورد نظر را بنویسید. اگر برند، مدل، نوع شناور و وضعیت مدنظر را هم دارید همان اول بفرستید تا دقیق‌تر بررسی کنم.",
      shortlist: [],
    };
  }

  if (catalog.length === 0) {
    return {
      status: "not_found",
      reply: "فعلا محصول منتشرشده‌ای در کاتالوگ برای بررسی ندارم. برای ثبت درخواست تامین، نوع قطعه، برند، مدل، وضعیت مدنظر و مشخصات فنی را بفرستید.",
      shortlist: [],
    };
  }

  const scored = scoreProducts(analysis.text, catalog);
  const shortlist = scored.filter((item) => item.score > 0).slice(0, 8).map((item) => item.product);
  const best = scored[0];
  const second = scored[1];

  if (!best || best.score < 1.2) {
    return {
      status: "not_found",
      reply: [
        "این کالا در محصولات ما موجود نمی‌باشد.",
        "اگر کالای دریایی مشابه یا نام فنی دیگری مدنظر دارید بفرستید؛ در غیر این صورت باید درخواست تامین خارج از فهرست ثبت شود.",
      ].join("\n"),
      shortlist: [],
    };
  }

  const shouldAskMore =
    !analysis.hasGroup ||
    !analysis.hasVessel ||
    !analysis.hasBrand ||
    !analysis.hasModel ||
    !analysis.hasCountry ||
    !analysis.hasCondition ||
    !analysis.hasStockPreference ||
    !analysis.hasTechnicalSpec ||
    !analysis.hasTags ||
    !analysis.hasLeadTimePreference;

  if (shouldAskMore) {
    return {
      status: "needs_info",
      suggestedProductId: best.product.id,
      suggestedProductName: best.product.name,
      reply: questionForMissingFields(analysis, scored),
      shortlist,
    };
  }

  if (!best || best.score < 2.2 || (analysis.hasUnknownModelMention && !analysis.hasModel && best.score < 6)) {
    return {
      status: "not_found",
      reply: [
        "با مشخصاتی که گفتید، محصول دقیقی در کاتالوگ فعلی پیدا نکردم.",
        "اگر برند/مدل جایگزین یا بازه مشخصات فنی قابل قبول دارید بفرستید؛ در غیر این صورت باید درخواست تامین خارج از فهرست ثبت شود.",
      ].join("\n"),
      shortlist: [],
    };
  }

  const isExactEnough = best.score >= 8 || (analysis.hasModel && best.score >= 6) || (analysis.hasBrand && analysis.hasTechnicalSpec && best.score >= 5);
  const status = isExactEnough ? "suggested" : "closest";
  const prefix = status === "suggested"
    ? "بر اساس مشخصاتی که گفتید، بهترین گزینه موجود این محصول است:"
    : "محصول دقیقا مطابق همه مشخصات پیدا نشد؛ نزدیک‌ترین گزینه موجود این است:";
  const comparison = second && second.score > 1
    ? `گزینه بعدی هم «${second.product.name}» بود، اما امتیاز تطبیق پایین‌تری داشت.`
    : "";

  return {
    status,
    suggestedProductId: best.product.id,
    suggestedProductName: best.product.name,
    reply: [
      prefix,
      productLine(best.product),
      comparison,
      "اگر برند، مدل یا وضعیت کالا را تغییر می‌دهید، بفرستید تا دوباره دقیق‌تر مقایسه کنم.",
    ].filter(Boolean).join("\n"),
    shortlist,
  };
}

function buildMessages(messages, products, localDecision) {
  const shortlist = localDecision.shortlist?.length ? localDecision.shortlist : products.slice(0, 8);
  const catalog = JSON.stringify(shortlist || []).slice(0, 60000);
  return [
    {
      role: "system",
      content: [
        "تو «دریا یار» هستی؛ دستیار فارسی انتخاب قطعات و تجهیزات دریایی برای سایت سیمرغ تامین دریا.",
        "رفتار اصلی: تعاملی و مرحله‌ای باش. قبل از پیشنهاد محصول نهایی باید همه این فیلدها از کاربر روشن شده باشد: گروه محصول، نوع شناور، برند، مدل، کشور، وضعیت کالا، موجودی، مشخصات فنی، تگ‌ها/کاربرد، زمان آماده‌سازی.",
        "اگر حتی یکی از این فیلدها روشن نیست، محصول نهایی معرفی نکن. نزدیک‌ترین گزینه فعلی را با عبارت «نزدیک‌ترین گزینه فعلی» نشان بده و فقط یک سوال بعدی برای اولین فیلد ناقص بپرس.",
        "فقط از بین catalog محصول پیشنهاد بده. محصول خارج از catalog نساز.",
        "اگر پیام کاربر به کالایی اشاره دارد که در catalog هیچ تطبیق معناداری ندارد یا غیرمرتبط با محصولات دریایی سایت است، سوال تکمیلی نپرس و مستقیم بگو: «این کالا در محصولات ما موجود نمی‌باشد.»",
        "اگر محصول دقیق نیست اما نزدیک‌ترین گزینه وجود دارد، صریح بگو «نزدیک‌ترین گزینه» است.",
        "اگر محصول مناسب وجود ندارد، صریح بگو موجود نداریم و اطلاعات لازم برای درخواست تامین را بپرس.",
        "نام تامین‌کننده را ذکر نکن.",
      ].join("\n"),
    },
    {
      role: "user",
      content: `وضعیت تصمیم محلی: ${JSON.stringify(localDecision)}\nکاتالوگ کوتاه‌شده:\n${catalog}`,
    },
    ...(messages || []).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || "").slice(0, 4000),
    })),
  ];
}

async function handleDaryaYar(req, res) {
  const startedAt = Date.now();
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (error) {
    const payload = await withMinimumDelay(startedAt, async () => ({
      error: error instanceof Error ? error.message : "بدنه درخواست معتبر نیست.",
    }));
    json(res, 400, payload);
    return;
  }

  const products = Array.isArray(body.products) ? body.products : [];
  const localDecision = buildLocalDecision(body.messages, products);
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (localDecision.status === "needs_info" || localDecision.status === "not_found" || !apiKey) {
    if (localDecision.status !== "needs_info" && localDecision.status !== "not_found" && !fallbackEnabled) {
      const payload = await withMinimumDelay(startedAt, async () => ({ error: "کلید OpenRouter روی سرور تنظیم نشده است." }));
      json(res, 500, payload);
      return;
    }
    const payload = await withMinimumDelay(startedAt, async () => ({ ...localDecision, source: "local-advisor" }));
    json(res, 200, payload);
    return;
  }

  try {
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:3000",
        "X-Title": "Darya Yar",
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(body.messages, products, localDecision),
        temperature: 0.25,
        max_tokens: 650,
      }),
    });

    const data = await openRouterResponse.json().catch(() => ({}));
    if (!openRouterResponse.ok) {
      if (fallbackEnabled) {
        const payload = await withMinimumDelay(startedAt, async () => ({
          ...localDecision,
          source: "local-advisor",
          providerError: data?.error?.message || data?.error || data?.message || "OpenRouter پاسخ موفق نداد.",
        }));
        json(res, 200, payload);
        return;
      }
      const payload = await withMinimumDelay(startedAt, async () => ({
        error: data?.error?.message || data?.error || data?.message || "OpenRouter پاسخ موفق نداد.",
      }));
      json(res, openRouterResponse.status, payload);
      return;
    }

    const payload = await withMinimumDelay(startedAt, async () => ({
      ...localDecision,
      reply: data?.choices?.[0]?.message?.content || localDecision.reply,
      source: "openrouter",
    }));
    json(res, 200, payload);
  } catch (error) {
    if (fallbackEnabled) {
      const payload = await withMinimumDelay(startedAt, async () => ({
        ...localDecision,
        source: "local-advisor",
        providerError: error instanceof Error ? error.message : "خطای نامشخص در اتصال به OpenRouter.",
      }));
      json(res, 200, payload);
      return;
    }
    const payload = await withMinimumDelay(startedAt, async () => ({
      error: error instanceof Error ? error.message : "خطای نامشخص در پردازش درخواست.",
    }));
    json(res, 500, payload);
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = resolve(distDir, requestedPath);
  const safePath = filePath.startsWith(distDir) && existsSync(filePath) ? filePath : join(distDir, "index.html");
  const ext = extname(safePath);

  try {
    const content = await readFile(safePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS" && req.url === "/api/darya-yar") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/darya-yar") {
    await handleDaryaYar(req, res);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    await serveStatic(req, res);
    return;
  }
  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
}).listen(port, host, () => {
  console.log(`Darya Yar server listening at http://${host}:${port}`);
});
