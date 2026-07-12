import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Anchor, Bot, Loader2, PackageSearch, RefreshCcw, Send, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { formatPriceToman, productGroups, type Product } from "../data/products";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  suggestedProductId?: string;
  suggestedProductName?: string;
};

const STARTER_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "سلام، من دریا یار هستم. نیاز فنی یا مشکل شناورتان را ساده بگویید. اول چند مشخصه مثل برند، مدل، نوع شناور و وضعیت کالا را می‌پرسم و بعد فقط اگر تطبیق کافی باشد محصول پیشنهاد می‌دهم.",
  },
];

const QUICK_PROMPTS = [
  "برای سیستم خنک‌کننده موتور دنبال پمپ مناسب هستم",
  "قطعه برق دریایی برای شناور باری نیاز دارم",
  "موتور کشتی خراب شده و قطعه جایگزین می‌خواهم",
];

function getDaryaYarEndpoint() {
  const configuredUrl = import.meta.env.VITE_DARYA_YAR_API_URL?.trim();
  if (configuredUrl) return configuredUrl;

  if (typeof window !== "undefined" && window.location.port === "3000") {
    return "http://127.0.0.1:5173/api/darya-yar";
  }

  return "/api/darya-yar";
}

export function RFQ() {
  const { products } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "published"),
    [products]
  );

  const productCatalog = useMemo(() => {
    return publishedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      country: product.country,
      group: productGroups.find((group) => group.id === product.productGroupId)?.name || product.productGroupId,
      productGroupId: product.productGroupId,
      subcategoryId: product.subcategoryId,
      hasPrice: product.hasPrice,
      price: product.hasPrice ? product.price : null,
      priceText: product.hasPrice ? formatPriceToman(product.price) : "استعلامی",
      stock: product.stock,
      vesselTypes: product.vesselTypes,
      condition: product.condition,
      conditionText: conditionLabel(product.condition),
      shortDesc: product.shortDesc,
      description: product.description.slice(0, 280),
      specs: product.specs,
      tags: product.tags || [],
      leadTime: product.leadTime,
    }));
  }, [publishedProducts]);

  const selectedProduct = useMemo(
    () => publishedProducts.find((product) => product.id === selectedProductId) || null,
    [publishedProducts, selectedProductId]
  );

  useEffect(() => {
    const scrollBox = chatScrollRef.current;
    if (!scrollBox) return;
    scrollBox.scrollTo({ top: scrollBox.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(getDaryaYarEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          products: productCatalog,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "ارتباط با دریا یار برقرار نشد.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "پاسخی دریافت نشد. لطفا دوباره تلاش کنید.",
        suggestedProductId: data.suggestedProductId,
        suggestedProductName: data.suggestedProductName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.suggestedProductId) {
        setSelectedProductId(data.suggestedProductId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص در ارتباط با دریا یار.");
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages(STARTER_MESSAGES);
    setInput("");
    setError("");
    setSelectedProductId("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-bl from-slate-950 via-cyan-950 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-bold mb-3">
              <Sparkles className="w-4 h-4" />
              راهنمای هوشمند انتخاب قطعات دریایی
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3">دریا یار</h1>
            <p className="text-slate-300 leading-7 max-w-2xl">
              نیازتان را بگویید؛ دریا یار قبل از پیشنهاد محصول، مشخصات مهم مثل برند، مدل، نوع شناور، وضعیت کالا و مشخصات فنی را مرحله‌به‌مرحله کامل می‌کند.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_340px] gap-5">
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[720px] max-h-[calc(100vh-150px)] min-h-[560px] flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-900">چت با دریا یار</h2>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              title="شروع دوباره"
              type="button"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 overscroll-contain">
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-700" />
                دریا یار در حال بررسی مشخصات و مقایسه محصولات است...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="نیاز فنی، برند، مدل یا وضعیت مدنظر را بنویسید..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-12 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white flex items-center justify-center transition disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-3">
              <PackageSearch className="w-5 h-5 text-cyan-700" />
              مبنای پیشنهاد
            </h3>
            <div className="space-y-3 text-sm text-slate-600 leading-7">
              <p>
                دریا یار از بین
                <span className="font-black text-slate-900 mx-1">{publishedProducts.length.toLocaleString("fa-IR")}</span>
                محصول منتشرشده بررسی می‌کند، اما قبل از پیشنهاد نهایی مشخصات کلیدی را کامل می‌پرسد.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-3">
              <Anchor className="w-5 h-5 text-blue-700" />
              فیلدهایی که بررسی می‌شود
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["گروه محصول", "نوع شناور", "برند", "مدل", "کشور", "وضعیت کالا", "موجودی", "مشخصات فنی", "تگ‌ها", "زمان آماده‌سازی"].map((item) => (
                <span key={item} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 font-bold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-cyan-50 rounded-2xl border border-cyan-100 p-5">
            <h3 className="font-black text-cyan-950 mb-2">بعد از پیشنهاد محصول</h3>
            <p className="text-sm text-cyan-900 leading-7 mb-3">
              {selectedProduct
                ? `آخرین پیشنهاد: ${selectedProduct.name}`
                : "وقتی محصولی با تطبیق کافی پیشنهاد شود، دکمه زیر مستقیم همان محصول را باز می‌کند."}
            </p>
            <Link
              to={selectedProduct ? `/product/${selectedProduct.id}` : "/products"}
              className={`inline-flex px-4 py-2 rounded-xl text-white text-sm font-bold transition ${
                selectedProduct ? "bg-cyan-700 hover:bg-cyan-800" : "bg-slate-400 pointer-events-none"
              }`}
            >
              {selectedProduct ? "مشاهده محصول پیشنهادی" : "هنوز محصولی پیشنهاد نشده"}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap border ${
          isUser
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 shadow-sm"
        }`}
      >
        {message.content}
        {!isUser && message.suggestedProductId && (
          <Link
            to={`/product/${message.suggestedProductId}`}
            className="mt-3 inline-flex rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-800"
          >
            مشاهده {message.suggestedProductName || "محصول پیشنهادی"}
          </Link>
        )}
      </div>
      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

function conditionLabel(condition: Product["condition"]) {
  if (condition === "new") return "نو";
  if (condition === "used") return "کارکرده";
  return "بازسازی‌شده";
}
