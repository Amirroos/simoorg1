import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  ClipboardList,
  Eye,
  FilePlus2,
  Hash,
  Package,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp, type AdminProductRequest } from "../../contexts/AppContext";
import {
  formatPriceToman,
  getCategoryIdForProductGroup,
  getDetailedSubcategoriesForProductGroup,
  marineImage,
  productGroups,
  vesselTypes,
  type Product,
} from "../../data/products";

const PLACEHOLDER_IMG = marineImage("درخواست محصول سیمرغ", "default");

type RequestForm = Omit<AdminProductRequest, "id" | "status" | "createdAt">;

const emptyRequestForm: RequestForm = {
  title: "",
  name: "",
  categoryId: "",
  productGroupId: "",
  subcategoryId: "",
  brand: "",
  model: "",
  country: "ایران",
  hasPrice: true,
  image: PLACEHOLDER_IMG,
  vesselTypes: [],
  condition: "new",
  shortDesc: "",
  description: "",
  specs: {},
  leadTime: 3,
  tags: [],
  neededBy: "",
};

type AdminProductsView = "published" | "requests" | "supplier";

export function AdminProducts() {
  return <AdminProductsPage view="published" />;
}

export function AdminRequestedProducts() {
  return <AdminProductsPage view="requests" />;
}

export function AdminSupplierProducts() {
  return <AdminProductsPage view="supplier" />;
}

function AdminProductsPage({ view }: { view: AdminProductsView }) {
  const {
    products,
    adminProductRequests,
    deleteProduct,
    updateProduct,
    publishProductWithProfit,
    rejectProduct,
    addAdminProductRequest,
    closeAdminProductRequest,
  } = useApp();

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [profitByProduct, setProfitByProduct] = useState<Record<string, number>>({});
  const [requestForm, setRequestForm] = useState<RequestForm>(emptyRequestForm);
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [tagText, setTagText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdminProductRequest | null>(null);
  const [requestWizardOpen, setRequestWizardOpen] = useState(false);
  const [requestWizardStep, setRequestWizardStep] = useState(0);

  const directPending = products.filter((product) => product.status === "pending" && product.workflowType !== "admin_request_offer");
  const requestOffers = products.filter((product) => product.status === "pending" && product.workflowType === "admin_request_offer");
  const publishedProducts = products.filter((product) => product.status === "published");

  const filteredPublished = publishedProducts.filter((product) => {
    const q = search.trim().toLowerCase();
    if (q && !product.name.toLowerCase().includes(q) && !product.brand.toLowerCase().includes(q)) return false;
    if (filterGroup && product.productGroupId !== filterGroup) return false;
    return true;
  });

  const groupedRequestOffers = useMemo(() => {
    return adminProductRequests.map((request) => ({
      request,
      offers: products.filter((product) => product.adminRequestId === request.id),
    }));
  }, [adminProductRequests, products]);
  const openGroupedRequestOffers = groupedRequestOffers.filter(({ request }) => request.status === "open");
  const closedGroupedRequestOffers = groupedRequestOffers.filter(({ request }) => request.status !== "open");

  const requestSubcategories = requestForm.productGroupId
    ? getDetailedSubcategoriesForProductGroup(requestForm.productGroupId)
    : [];

  const updateRequestForm = (patch: Partial<RequestForm>) => {
    setRequestForm((prev) => ({ ...prev, ...patch }));
  };

  const toggleVesselType = (vessel: string) => {
    updateRequestForm({
      vesselTypes: requestForm.vesselTypes.includes(vessel)
        ? requestForm.vesselTypes.filter((item) => item !== vessel)
        : [...requestForm.vesselTypes, vessel],
    });
  };

  const addTag = () => {
    const tag = tagText.trim().replace(/^#/, "");
    if (!tag || requestForm.tags?.includes(tag)) return;
    updateRequestForm({ tags: [...(requestForm.tags || []), tag] });
    setTagText("");
  };

  const handleCreateRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (requestWizardStep < 2) {
      setRequestWizardStep((step) => Math.min(2, step + 1));
      return;
    }
    if (!requestForm.name.trim() || !requestForm.productGroupId || !requestForm.brand.trim() || !requestForm.shortDesc.trim()) return;

    const specs: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim() && row.value.trim()) specs[row.key.trim()] = row.value.trim();
    });

    addAdminProductRequest({
      ...requestForm,
      title: requestForm.title.trim() || requestForm.name.trim(),
      name: requestForm.name.trim(),
      categoryId: requestForm.categoryId || getCategoryIdForProductGroup(requestForm.productGroupId),
      description: requestForm.description.trim() || requestForm.shortDesc.trim(),
      specs,
    });

    setRequestForm(emptyRequestForm);
    setSpecRows([{ key: "", value: "" }]);
    setTagText("");
    setRequestWizardOpen(false);
    setRequestWizardStep(0);
  };

  const handlePublish = (productId: string) => {
    publishProductWithProfit(productId, profitByProduct[productId] ?? 20);
  };

  const adjustStock = (id: string, delta: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    updateProduct(id, { stock: Math.max(0, product.stock + delta) });
  };

  const removeProduct = (id: string, name: string) => {
    if (confirm(`آیا از حذف محصول "${name}" مطمئن هستید؟`)) {
      deleteProduct(id);
    }
  };

  const pageTitle = {
    published: "محصولات انتشار یافته",
    requests: "محصولات درخواستی",
    supplier: "محصولات تامین کننده",
  }[view];

  const pageSubtitle = {
    published: "لیست محصولاتی که بعد از تایید ادمین روی سایت منتشر شده‌اند.",
    requests: "درخواست‌های ادمین و پاسخ‌های تامین‌کننده‌ها به همان درخواست‌ها را مدیریت کنید.",
    supplier: "محصولاتی که تامین‌کننده‌ها مستقیم معرفی کرده‌اند و منتظر تایید ادمین هستند.",
  }[view];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">
            {pageSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="پیشنهاد مستقیم" value={directPending.length} tone="amber" />
          <Stat label="پاسخ درخواست" value={requestOffers.length} tone="purple" />
          <Stat label="منتشر شده" value={publishedProducts.length} tone="emerald" />
        </div>
      </div>

      {view === "requests" && (
        <>
      <section className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900">ثبت درخواست محصول کامل برای تامین‌کننده‌ها</h2>
              <p className="text-xs text-slate-500 mt-1">فرم کامل درخواست در یک مودال مرحله‌ای باز می‌شود و از محتوای این صفحه جداست.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRequestWizardOpen(true);
              setRequestWizardStep(0);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm transition"
          >
            ثبت درخواست محصول کامل
          </button>
        </div>
      </section>

      {requestWizardOpen && (
        <Modal title="ثبت درخواست محصول کامل برای تامین‌کننده‌ها" onClose={() => setRequestWizardOpen(false)}>
          <section className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["اطلاعات پایه", "شرح و سازگاری", "مشخصات و رسانه"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRequestWizardStep(index)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    requestWizardStep === index ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl p-5 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <FilePlus2 className="w-5 h-5 text-cyan-700" />
          <h2 className="font-black text-slate-900">ثبت درخواست محصول کامل برای تامین‌کننده‌ها</h2>
        </div>

        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className={requestWizardStep === 0 ? "grid md:grid-cols-3 gap-3" : "hidden"}>
            <TextInput label="نام محصول" value={requestForm.name} onChange={(value) => updateRequestForm({ name: value, title: value })} required />
            <TextInput label="برند" value={requestForm.brand} onChange={(value) => updateRequestForm({ brand: value })} required />
            <TextInput label="مدل" value={requestForm.model} onChange={(value) => updateRequestForm({ model: value })} />
            <TextInput label="کشور" value={requestForm.country} onChange={(value) => updateRequestForm({ country: value })} />
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">گروه محصول</label>
              <select
                value={requestForm.productGroupId}
                onChange={(event) => {
                  const productGroupId = event.target.value;
                  updateRequestForm({
                    productGroupId,
                    categoryId: productGroupId ? getCategoryIdForProductGroup(productGroupId) : "",
                    subcategoryId: "",
                  });
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                required
              >
                <option value="">انتخاب کنید</option>
                {productGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">زیرگروه</label>
              <select
                value={requestForm.subcategoryId}
                disabled={!requestForm.productGroupId}
                onChange={(event) => updateRequestForm({ subcategoryId: event.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm disabled:opacity-50"
              >
                <option value="">انتخاب کنید</option>
                {requestSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={requestWizardStep === 0 ? "grid md:grid-cols-3 gap-3" : "hidden"}>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">وضعیت محصول</label>
              <select
                value={requestForm.condition}
                onChange={(event) => updateRequestForm({ condition: event.target.value as Product["condition"] })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
              >
                <option value="new">نو</option>
                <option value="refurbished">بازسازی‌شده</option>
                <option value="used">کارکرده</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">نوع قیمت</label>
              <select
                value={requestForm.hasPrice ? "fixed" : "inquiry"}
                onChange={(event) => updateRequestForm({ hasPrice: event.target.value === "fixed" })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
              >
                <option value="fixed">قیمت‌دار</option>
                <option value="inquiry">استعلامی</option>
              </select>
            </div>
            <TextInput label="زمان آماده‌سازی مدنظر" type="number" value={String(requestForm.leadTime)} onChange={(value) => updateRequestForm({ leadTime: Number(value) || 0 })} />
          </div>

          <div className={requestWizardStep === 1 ? "block" : "hidden"}>
            <label className="block text-xs font-bold text-slate-600 mb-1">سازگاری با شناورها</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {vesselTypes.map((vessel) => {
                const selected = requestForm.vesselTypes.includes(vessel);
                return (
                  <button
                    key={vessel}
                    type="button"
                    onClick={() => toggleVesselType(vessel)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      selected ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Anchor className="w-3 h-3 inline ml-1" />
                    {vessel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={requestWizardStep === 1 ? "grid md:grid-cols-2 gap-3" : "hidden"}>
            <Textarea label="توضیح کوتاه" value={requestForm.shortDesc} onChange={(value) => updateRequestForm({ shortDesc: value })} required />
            <Textarea label="توضیحات کامل" value={requestForm.description} onChange={(value) => updateRequestForm({ description: value })} />
          </div>

          <div className={requestWizardStep === 2 ? "block" : "hidden"}>
            <label className="block text-xs font-bold text-slate-600 mb-2">مشخصات فنی</label>
            <div className="space-y-2">
              {specRows.map((row, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={row.key}
                    onChange={(event) => setSpecRows((prev) => prev.map((item, i) => i === index ? { ...item, key: event.target.value } : item))}
                    placeholder="ویژگی"
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                  />
                  <input
                    value={row.value}
                    onChange={(event) => setSpecRows((prev) => prev.map((item, i) => i === index ? { ...item, value: event.target.value } : item))}
                    placeholder="مقدار"
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecRows((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))}
                    className="w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSpecRows((prev) => [...prev, { key: "", value: "" }])}
                className="text-xs font-bold text-cyan-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن مشخصه
              </button>
            </div>
          </div>

          <div className={requestWizardStep === 2 ? "grid md:grid-cols-[1fr_220px] gap-3" : "hidden"}>
            <TextInput label="آدرس تصویر" value={requestForm.image} onChange={(value) => updateRequestForm({ image: value || PLACEHOLDER_IMG })} />
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">تگ‌ها</label>
              <div className="flex gap-2">
                <input
                  value={tagText}
                  onChange={(event) => setTagText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                />
                <button type="button" onClick={addTag} className="w-11 rounded-xl bg-cyan-700 text-white">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(requestForm.tags || []).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              disabled={requestWizardStep === 0}
              onClick={() => setRequestWizardStep((step) => Math.max(0, step - 1))}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition disabled:opacity-40"
            >
              مرحله قبل
            </button>
            {requestWizardStep < 2 ? (
              <button
                type="button"
                onClick={() => setRequestWizardStep((step) => Math.min(2, step + 1))}
                className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm transition"
              >
                مرحله بعد
              </button>
            ) : (
              <button className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm transition">
                ایجاد درخواست برای همه تامین‌کننده‌ها
              </button>
            )}
          </div>
        </form>
            </div>
          </section>
        </Modal>
      )}

      <PendingSection
        title="پاسخ تامین‌کننده‌ها به درخواست‌های ادمین"
        subtitle="از بین پیشنهادهای قیمت/موجودی تامین‌کننده‌ها یکی را انتخاب کنید، درصد سود را ببندید و release کنید."
        products={requestOffers}
        profitByProduct={profitByProduct}
        setProfitByProduct={setProfitByProduct}
        onPublish={handlePublish}
        onReject={rejectProduct}
        onDelete={removeProduct}
        onView={setSelectedProduct}
        emptyText="هنوز پاسخی برای درخواست‌های ادمین ثبت نشده است."
      />

      <section className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              درخواست‌های ایجادشده توسط ادمین
            </h2>
            <p className="text-xs text-slate-500 mt-1">برای هر درخواست، تعداد پیشنهادهای تامین‌کننده‌ها قابل ردیابی است.</p>
          </div>
        </div>
        {groupedRequestOffers.length === 0 ? (
          <EmptyState text="هنوز درخواستی ایجاد نشده است." />
        ) : (
          <div className="space-y-4">
            <AdminRequestsTable
              title="درخواست‌های باز"
              rows={openGroupedRequestOffers}
              emptyText="درخواست بازی وجود ندارد."
              onView={setSelectedRequest}
              onClose={closeAdminProductRequest}
            />
            <AdminRequestsTable
              title="درخواست‌های بسته‌شده"
              rows={closedGroupedRequestOffers}
              emptyText="درخواست بسته‌شده‌ای وجود ندارد."
              onView={setSelectedRequest}
              onClose={closeAdminProductRequest}
            />
          </div>
        )}
      </section>
        </>
      )}

      {view === "supplier" && (
        <PendingSection
          title="محصولات معرفی‌شده مستقیم توسط تامین‌کننده"
          subtitle="قبل از تایید، همه اطلاعات پر شده توسط تامین‌کننده را در تب مشاهده اطلاعات بررسی کنید."
          products={directPending}
          profitByProduct={profitByProduct}
          setProfitByProduct={setProfitByProduct}
          onPublish={handlePublish}
          onReject={rejectProduct}
          onDelete={removeProduct}
          onView={setSelectedProduct}
          emptyText="محصول مستقیم در انتظار تایید وجود ندارد."
        />
      )}

      {view === "published" && (
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-black text-slate-900 mb-3">محصولات منتشرشده در سایت</h2>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو در محصول منتشرشده..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <select
              value={filterGroup}
              onChange={(event) => setFilterGroup(event.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
            >
              <option value="">همه گروه‌ها</option>
              {productGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredPublished.length === 0 ? (
          <EmptyState text="محصول منتشرشده‌ای پیدا نشد." />
        ) : (
          <ProductTable
            products={filteredPublished}
            mode="published"
            onStockChange={adjustStock}
            onDelete={removeProduct}
            onView={setSelectedProduct}
          />
        )}
      </section>
      )}

      {selectedProduct && <ProductInfoModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {selectedRequest && <RequestInfoModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </div>
  );
}

function PendingSection(props: {
  title: string;
  subtitle: string;
  products: Product[];
  profitByProduct: Record<string, number>;
  setProfitByProduct: (value: Record<string, number>) => void;
  onPublish: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onView: (product: Product) => void;
  emptyText: string;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-amber-600" />
            {props.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{props.subtitle}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">
          {props.products.length.toLocaleString("fa-IR")} مورد
        </span>
      </div>
      {props.products.length === 0 ? (
        <EmptyState text={props.emptyText} />
      ) : (
        <ProductTable
          products={props.products}
          mode="pending"
          profitByProduct={props.profitByProduct}
          setProfitByProduct={props.setProfitByProduct}
          onPublish={props.onPublish}
          onReject={props.onReject}
          onDelete={props.onDelete}
          onView={props.onView}
        />
      )}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "amber" | "emerald" | "rose" | "purple" }) {
  const classes = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className={`rounded-xl px-4 py-2 ${classes[tone]}`}>
      <div className="text-lg font-black">{value.toLocaleString("fa-IR")}</div>
      <div className="text-[10px] font-bold">{label}</div>
    </div>
  );
}

function TextInput(props: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{props.label}</label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        required={props.required}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm"
      />
    </div>
  );
}

function Textarea(props: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        required={props.required}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none text-sm resize-none"
      />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-slate-500">
      <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
      <p>{text}</p>
    </div>
  );
}

function AdminRequestsTable({
  title,
  rows,
  emptyText,
  onView,
  onClose,
}: {
  title: string;
  rows: { request: AdminProductRequest; offers: Product[] }[];
  emptyText: string;
  onView: (request: AdminProductRequest) => void;
  onClose: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-sm">{title}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
          {rows.length.toLocaleString("fa-IR")} مورد
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-700 border border-slate-200">درخواست</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700 border border-slate-200">شرح</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">وضعیت</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">پیشنهادها</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ request, offers }) => (
                <tr key={request.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 border border-slate-200 align-top">
                    <div className="font-bold text-slate-900">{request.name || request.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{request.brand || "-"} • {request.model || "-"}</div>
                  </td>
                  <td className="px-4 py-3 border border-slate-200 align-top text-slate-600 leading-7 min-w-[260px]">
                    {request.shortDesc || request.description || "-"}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-center align-top">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                        request.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {request.status === "open" ? "باز" : "بسته"}
                    </span>
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-center align-top font-bold text-slate-700">
                    {offers.length.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-center align-top">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onView(request)}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      >
                        مشاهده اطلاعات
                      </button>
                      {request.status === "open" && (
                        <button
                          onClick={() => onClose(request.id)}
                          className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                        >
                          بستن درخواست
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface ProductTableProps {
  products: Product[];
  mode: "pending" | "published";
  profitByProduct?: Record<string, number>;
  setProfitByProduct?: (value: Record<string, number>) => void;
  onPublish?: (id: string) => void;
  onReject?: (id: string) => void;
  onStockChange?: (id: string, delta: number) => void;
  onDelete: (id: string, name: string) => void;
  onView: (product: Product) => void;
}

function ProductTable({
  products,
  mode,
  profitByProduct = {},
  setProfitByProduct,
  onPublish,
  onReject,
  onStockChange,
  onDelete,
  onView,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 border border-slate-200">محصول</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 border border-slate-200 hidden md:table-cell">تامین‌کننده</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 border border-slate-200">قیمت</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">موجودی</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const basePrice = product.supplierBasePrice ?? product.price;
            const profit = profitByProduct[product.id] ?? product.adminProfitPercent ?? 20;
            const finalPrice = product.hasPrice ? Math.round(basePrice * (1 + profit / 100)) : 0;

            return (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-slate-50 transition"
              >
                <td className="px-4 py-3 border border-slate-200 align-top">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 line-clamp-1">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.brand} • {product.model}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(product.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold">
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border border-slate-200 align-top hidden md:table-cell">
                  <div className="text-xs text-slate-700 font-semibold">{product.sellerName}</div>
                  <div className="text-[10px] text-slate-400">
                    {product.workflowType === "admin_request_offer" ? "پاسخ به درخواست ادمین" : "معرفی مستقیم تامین‌کننده"}
                  </div>
                </td>
                <td className="px-4 py-3 border border-slate-200 align-top">
                  {product.hasPrice ? (
                    <div className="space-y-1">
                      {mode === "pending" && (
                        <div className="text-xs text-slate-500">
                          پایه: <span className="font-bold">{formatPriceToman(basePrice)}</span>
                        </div>
                      )}
                      {mode === "pending" && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={profit}
                            onChange={(event) =>
                              setProfitByProduct?.({
                                ...profitByProduct,
                                [product.id]: Number(event.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center text-xs"
                          />
                          <span className="text-xs text-slate-500">% سود</span>
                        </div>
                      )}
                      <div className="text-sm font-bold text-cyan-700 whitespace-nowrap">
                        {mode === "pending" ? formatPriceToman(finalPrice) : formatPriceToman(product.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-cyan-700">استعلامی</div>
                  )}
                </td>
                <td className="px-4 py-3 border border-slate-200 text-center align-top">
                  {mode === "published" ? (
                    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button onClick={() => onStockChange?.(product.id, -1)} className="w-6 h-6 rounded bg-white hover:bg-slate-50">−</button>
                      <span className={`min-w-[40px] text-center font-bold text-sm ${
                        product.stock === 0 ? "text-rose-600" : product.stock < 5 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {product.stock.toLocaleString("fa-IR")}
                      </span>
                      <button onClick={() => onStockChange?.(product.id, 1)} className="w-6 h-6 rounded bg-white hover:bg-slate-50">+</button>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700">{product.stock.toLocaleString("fa-IR")}</span>
                  )}
                  {product.stock === 0 && (
                    <div className="text-[10px] text-rose-600 font-bold mt-1 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      اتمام موجودی
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 border border-slate-200 text-center align-top">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onView(product)}
                      className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-bold transition"
                    >
                      <Eye className="w-4 h-4" />
                      اطلاعات
                    </button>
                    {mode === "pending" ? (
                      <>
                        <button onClick={() => onPublish?.(product.id)} className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center gap-1 text-xs font-bold transition">
                          <CheckCircle2 className="w-4 h-4" />
                          Release
                        </button>
                        <button onClick={() => onReject?.(product.id)} className="h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 text-xs font-bold transition">
                          <XCircle className="w-4 h-4" />
                          رد
                        </button>
                      </>
                    ) : (
                      <Link to={`/product/${product.id}`} target="_blank" className="w-8 h-8 rounded-lg hover:bg-cyan-50 text-cyan-700 flex items-center justify-center transition">
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    <button onClick={() => onDelete(product.id, product.name)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductInfoModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <Modal onClose={onClose} title="مشاهده اطلاعات محصول تامین‌کننده">
      <div className="grid md:grid-cols-[220px_1fr] gap-5">
        <img src={product.image} alt={product.name} className="w-full aspect-square rounded-2xl object-cover bg-slate-100" />
        <div className="space-y-3">
          <InfoRow label="نام محصول" value={product.name} />
          <InfoRow label="برند / مدل" value={`${product.brand} / ${product.model || "-"}`} />
          <InfoRow label="کشور" value={product.country} />
          <InfoRow label="تامین‌کننده" value={product.sellerName} />
          <InfoRow label="قیمت پایه" value={product.hasPrice ? formatPriceToman(product.supplierBasePrice ?? product.price) : "استعلامی"} />
          <InfoRow label="موجودی" value={`${product.stock.toLocaleString("fa-IR")} عدد`} />
          <InfoRow label="زمان آماده‌سازی" value={`${product.leadTime.toLocaleString("fa-IR")} روز`} />
          <InfoRow label="وضعیت" value={product.condition === "new" ? "نو" : product.condition === "used" ? "کارکرده" : "بازسازی‌شده"} />
          {product.supplierOfferNote && <InfoRow label="توضیح تامین‌کننده" value={product.supplierOfferNote} />}
        </div>
      </div>
      <div className="mt-5">
        <h4 className="font-bold mb-2">توضیحات</h4>
        <p className="text-sm text-slate-700 leading-7">{product.description}</p>
      </div>
      <SpecsView specs={product.specs} />
    </Modal>
  );
}

function RequestInfoModal({ request, onClose }: { request: AdminProductRequest; onClose: () => void }) {
  return (
    <Modal onClose={onClose} title="مشاهده اطلاعات درخواست ادمین">
      <div className="grid md:grid-cols-[220px_1fr] gap-5">
        <img src={request.image} alt={request.name} className="w-full aspect-square rounded-2xl object-cover bg-slate-100" />
        <div className="space-y-3">
          <InfoRow label="نام محصول" value={request.name || request.title} />
          <InfoRow label="برند / مدل" value={`${request.brand || "-"} / ${request.model || "-"}`} />
          <InfoRow label="کشور" value={request.country || "-"} />
          <InfoRow label="نوع قیمت" value={request.hasPrice ? "قیمت‌دار" : "استعلامی"} />
          <InfoRow label="زمان مدنظر" value={`${(request.leadTime || 0).toLocaleString("fa-IR")} روز`} />
          <InfoRow label="وضعیت" value={request.condition === "new" ? "نو" : request.condition === "used" ? "کارکرده" : "بازسازی‌شده"} />
        </div>
      </div>
      <div className="mt-5">
        <h4 className="font-bold mb-2">شرح درخواست</h4>
        <p className="text-sm text-slate-700 leading-7">{request.description || request.shortDesc}</p>
      </div>
      <SpecsView specs={request.specs || {}} />
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <div className="w-32 text-slate-500">{label}</div>
      <div className="flex-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SpecsView({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) return null;
  return (
    <div className="mt-5">
      <h4 className="font-bold mb-2">مشخصات فنی</h4>
      <div className="grid md:grid-cols-2 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-xl bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">{key}: </span>
            <span className="font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
