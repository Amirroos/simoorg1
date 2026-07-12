import { useState } from "react";
import {
  Anchor,
  CheckCircle2,
  Clock,
  Hash,
  Package,
  Send,
  XCircle,
} from "lucide-react";
import { useApp, type AdminProductRequest } from "../../contexts/AppContext";
import { formatPriceToman, getDetailedSubcategoriesForProductGroup, productGroups, type Product } from "../../data/products";

type ExistingOffer = Product | undefined;

export function SellerAdminRequests() {
  const { user, products, adminProductRequests } = useApp();
  const [search, setSearch] = useState("");

  const myRequestOffers = products.filter(
    (product) => product.workflowType === "admin_request_offer" && product.sellerId === user?.id
  );

  const openRequests = adminProductRequests
    .filter((request) => request.status === "open")
    .filter((request) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [request.name, request.title, request.brand, request.model, request.shortDesc, request.description]
        .some((value) => value?.toLowerCase().includes(q));
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">درخواست‌های ادمین</h1>
          <p className="text-sm text-slate-500">
            ادمین مشخصات محصول را کامل ثبت می‌کند. شما فقط موجودی، قیمت تامین و زمان آماده‌سازی خودتان را اعلام می‌کنید.
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-center">
          <div className="text-lg font-black text-purple-700">{openRequests.length.toLocaleString("fa-IR")}</div>
          <div className="text-[10px] font-bold text-slate-500">درخواست باز</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو در درخواست‌های ادمین..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
        />
      </div>

      {openRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold mb-2">در حال حاضر درخواست بازی از سمت ادمین وجود ندارد.</h3>
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-4">
          {openRequests.map((request) => (
            <RequestOfferCard
              key={request.id}
              request={request}
              existingOffer={myRequestOffers.find((offer) => offer.adminRequestId === request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestOfferCard({ request, existingOffer }: { request: AdminProductRequest; existingOffer: ExistingOffer }) {
  const { submitAdminRequestOffer } = useApp();
  const [price, setPrice] = useState(existingOffer?.supplierBasePrice || existingOffer?.price || 0);
  const [stock, setStock] = useState(existingOffer?.stock || 1);
  const [leadTime, setLeadTime] = useState(existingOffer?.leadTime || request.leadTime || 3);
  const [note, setNote] = useState(existingOffer?.supplierOfferNote || "");
  const [saved, setSaved] = useState(false);
  const isLockedPendingOffer = existingOffer?.status === "pending";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLockedPendingOffer) return;
    const result = submitAdminRequestOffer(request.id, { price, stock, leadTime, note });
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="grid md:grid-cols-[180px_1fr] gap-0">
        <img src={request.image} alt={request.name || request.title} className="w-full h-full min-h-[180px] object-cover bg-slate-100" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-black text-slate-900">{request.name || request.title}</h2>
              <div className="text-xs text-slate-500 mt-1">
                {request.brand || "-"} • {request.model || "-"} • {request.country || "-"}
              </div>
            </div>
            {existingOffer && <StatusBadge status={existingOffer.status} />}
          </div>

          <p className="text-sm text-slate-700 leading-7">{request.shortDesc || request.description}</p>
        </div>
      </div>

      <div className="p-5 pt-0 space-y-4">
        <AdminRequestDetails request={request} />

        <form onSubmit={submit} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-slate-900 text-sm">پاسخ تامین‌کننده</h3>
            {existingOffer?.hasPrice && (
              <span className="text-[10px] font-bold text-purple-700 bg-white rounded-full px-2 py-1">
                آخرین قیمت: {formatPriceToman(existingOffer.supplierBasePrice ?? existingOffer.price)}
              </span>
            )}
          </div>

          {isLockedPendingOffer && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 text-amber-700 px-3 py-2 text-xs font-bold">
              پاسخ شما در انتظار تایید ادمین است و تا تعیین وضعیت قابل ویرایش نیست.
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <NumberInput label="قیمت تامین شما (ریال)" value={price} onChange={setPrice} min={0} required disabled={isLockedPendingOffer} />
            <NumberInput label="موجودی قابل تامین" value={stock} onChange={setStock} min={0} required disabled={isLockedPendingOffer} />
            <NumberInput label="زمان آماده‌سازی (روز)" value={leadTime} onChange={setLeadTime} min={0} required disabled={isLockedPendingOffer} />
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={isLockedPendingOffer}
            rows={2}
            placeholder="توضیح تکمیلی برای ادمین"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm resize-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
          />

          {!isLockedPendingOffer && (
            <button className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {existingOffer ? "به‌روزرسانی قیمت و موجودی" : "ثبت قیمت و موجودی"}
            </button>
          )}

          {saved && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-center font-bold">
              پاسخ شما برای بررسی ادمین ثبت شد.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function AdminRequestDetails({ request }: { request: AdminProductRequest }) {
  const group = productGroups.find((item) => item.id === request.productGroupId);
  const subcategory = request.productGroupId
    ? getDetailedSubcategoriesForProductGroup(request.productGroupId).find((item) => item.id === request.subcategoryId)
    : undefined;
  const specs = Object.entries(request.specs || {});

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-2 text-xs">
        <Info label="گروه محصول" value={group?.name || "-"} />
        <Info label="زیرگروه" value={subcategory?.name || "-"} />
        <Info label="نوع قیمت" value={request.hasPrice ? "قیمت‌دار" : "استعلامی"} />
        <Info label="وضعیت محصول" value={conditionLabel(request.condition)} />
        <Info label="زمان مدنظر ادمین" value={`${(request.leadTime || 0).toLocaleString("fa-IR")} روز`} />
        <Info label="تاریخ نیاز" value={request.neededBy || "-"} />
      </div>

      {request.vesselTypes.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-500 mb-2">سازگاری با شناورها</div>
          <div className="flex flex-wrap gap-1.5">
            {request.vesselTypes.map((vessel) => (
              <span key={vessel} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-slate-700 text-[10px] font-bold">
                <Anchor className="w-3 h-3 text-cyan-700" />
                {vessel}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-slate-500 mb-2">توضیحات کامل ادمین</div>
        <p className="text-sm text-slate-700 leading-7">{request.description || request.shortDesc || "-"}</p>
      </div>

      {specs.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-500 mb-2">مشخصات فنی</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {specs.map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">{key}: </span>
                <span className="font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {request.tags && request.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {request.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold">
              <Hash className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  required,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm bg-white disabled:bg-slate-100 disabled:text-slate-500"
        required={required}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <div className="text-slate-500 mb-1">{label}</div>
      <div className="font-bold text-slate-800">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold ${
        status === "published"
          ? "bg-emerald-50 text-emerald-700"
          : status === "rejected"
            ? "bg-rose-50 text-rose-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {status === "published" ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : status === "rejected" ? (
        <XCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {status === "published" ? "تایید و منتشر شده" : status === "rejected" ? "رد شده" : "در انتظار ادمین"}
    </div>
  );
}

function conditionLabel(condition: Product["condition"]) {
  if (condition === "new") return "نو";
  if (condition === "used") return "کارکرده";
  return "بازسازی‌شده";
}
