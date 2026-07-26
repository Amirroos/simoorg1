import rawCatalog from "./sheetCatalog.generated.json";

export interface SheetCatalogRecord {
  id: string;
  group: string;
  groupEn: string;
  subgroup: string;
  subgroupEn: string;
  category: string;
  categoryEn: string;
  brand: string;
  model: string;
  country: string;
  source: string;
}

export interface SheetCatalogOption {
  id: string;
  name: string;
  nameEn: string;
}

export const sheetCatalogRecords = rawCatalog as SheetCatalogRecord[];

function stableId(prefix: string, value: string) {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) return `${prefix}-${normalized}`;

  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return `${prefix}-${hash.toString(36)}`;
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export const sheetCatalogGroups: SheetCatalogOption[] = uniqueBy(sheetCatalogRecords, (record) => record.group)
  .map((record) => ({
    id: stableId("catalog-group", record.groupEn || record.group),
    name: record.group,
    nameEn: record.groupEn,
  }));

export function getSheetCatalogGroupId(record: Pick<SheetCatalogRecord, "group" | "groupEn">) {
  return stableId("catalog-group", record.groupEn || record.group);
}

export function getSheetCatalogSubgroupId(record: Pick<SheetCatalogRecord, "group" | "groupEn" | "subgroup" | "subgroupEn">) {
  const groupId = getSheetCatalogGroupId(record);
  return `${groupId}--${stableId("subgroup", record.subgroupEn || record.subgroup)}`;
}

export function getSheetCatalogSubgroups(groupId: string): SheetCatalogOption[] {
  return uniqueBy(
    sheetCatalogRecords.filter((record) => getSheetCatalogGroupId(record) === groupId),
    (record) => record.subgroup
  ).map((record) => ({
    id: getSheetCatalogSubgroupId(record),
    name: record.subgroup,
    nameEn: record.subgroupEn,
  }));
}

export function getSheetCatalogCategories(groupId: string, subgroupId: string): SheetCatalogOption[] {
  return uniqueBy(
    sheetCatalogRecords.filter(
      (record) =>
        getSheetCatalogGroupId(record) === groupId &&
        getSheetCatalogSubgroupId(record) === subgroupId
    ),
    (record) => record.category
  ).map((record) => ({
    id: record.category,
    name: record.category,
    nameEn: record.categoryEn,
  }));
}

export function getSheetCatalogRecordsForSubgroup(groupId: string, subgroupId: string) {
  return sheetCatalogRecords.filter(
    (record) =>
      getSheetCatalogGroupId(record) === groupId &&
      getSheetCatalogSubgroupId(record) === subgroupId
  );
}

export function mapSheetGroupToLegacyProductGroup(groupName: string) {
  if (/موتور، پیشرانش/.test(groupName)) return "propulsion";
  if (/ناوبری/.test(groupName)) return "navigation-aids";
  if (/پمپ، ولو، پایپینگ/.test(groupName)) return "pipes-fittings-valves";
  if (/تهویه، تبرید/.test(groupName)) return "ventilation-refrigeration";
  if (/اتوماسیون، کنترل/.test(groupName)) return "control-monitoring";
  if (/عرشه، لنگر/.test(groupName)) return "deck-operations";
  if (/برق، تولید/.test(groupName)) return "electrical";
  if (/ایمنی، نجات/.test(groupName)) return "safety-rescue";
  if (/مخابرات و ارتباطات/.test(groupName)) return "telecommunications";
  if (/هیدرولیک، پنوماتیک/.test(groupName)) return "hydraulic";
  if (/مواد مصرفی، روغن/.test(groupName)) return "rope-oil-grease-paint";
  if (/رفاهی، دکوراتیو/.test(groupName)) return "accommodation-galley";
  if (/ماشین‌آلات فرعی/.test(groupName)) return "pumps-purifiers";
  if (/ابزار دقیق/.test(groupName)) return "sensors";
  return "other-products";
}

export function catalogVisualFamily(record: Pick<SheetCatalogRecord, "group" | "subgroup" | "category" | "categoryEn">) {
  // The category is intentionally weighted above its parent group. For example,
  // a gearbox must show a gearbox photo even when its parent group also says "engine".
  const text = `${record.category} ${record.categoryEn}`.toLowerCase();
  if (/piston|cylinder|liner|connecting rod|injector|injection|bearing|turbo|پیستون|سیلندر|لاینر|شاتون|انژکتور|یاتاقان|توربو/.test(text)) return "engine-parts";
  if (/engine|motor|exhaust|silencer|expansion joint|موتور|اگزوز/.test(text)) return "engine";
  if (/shaft|propeller|thruster|waterjet|شافت|پروانه|رانشگر/.test(text)) return "propulsion";
  if (/gear|clutch|گیربکس|کلاچ/.test(text)) return "gear";
  if (/industrial filter|strainer|cartridge|filter|فیلتر|صافی/.test(text)) return "filter";
  if (/pump|bilge|compressor|blower|air dryer|receiver|پمپ|کمپرسور/.test(text)) return "pump";
  if (/valve|pipe|flange|hose|packing|jointing|line sealing|ولو|شیر|لوله|فلنج|شیلنگ|آب‌بندی/.test(text)) return "valve";
  if (/radar|gps|ais|ecdis|navigation|compass|echo sounder|depth finder|speed log|vdr|bnwas|رادار|ناوبری|قطب|عمق‌سنج/.test(text)) return "radar";
  if (/radio|antenna|satellite|vhf|uhf|communication|gmdss|navtex|dsc|intercom|talk back|public address|telephone|voip|ip phone|ship network|router|رادیو|آنتن|مخابرات|ماهواره/.test(text)) return "radio";
  if (/battery|charger|ups|emergency power|dc distribution|باتری|شارژر|برق اضطراری/.test(text)) return "battery";
  if (/switchboard|breaker|relay|fuse|transformer|converter|inverter|rectifier|cable|terminal|lug|connector|lighting|تابلو|فیوز|رله|ترانس|کابل|ترمینال|روشنایی/.test(text)) return "switchgear";
  if (/generator|alternator|electrical|ژنراتور|آلترناتور|برق/.test(text)) return "electrical";
  if (/fire|life|safety|rescue|sart|epirb|emergency equipment|first aid|medical|smoke|heat detector|flame|gas detector|helmet|gloves|shoes|goggles|fall protection|حریق|نجات|ایمنی|جلیقه|کلاه|دستکش/.test(text)) return "safety";
  if (/mooring|rope|hawser|wire rope|bollard|fairlead|chock|cargo lashing|securing|fender|مهاربندی|طناب|سیم بکسل|بولارد|فندر/.test(text)) return "mooring";
  if (/anchor|winch|windlass|crane|deck|searchlight|operational signals|لنگر|وینچ|جرثقیل|عرشه|نورافکن/.test(text)) return "deck";
  if (/hvac|fan|refriger|cool|chiller|air conditioning|cold room|ice maker|freezer|تهویه|تبرید|هواکش|سردخانه|چیلر/.test(text)) return "hvac";
  if (/hydraulic|pneumatic|steering|rudder stock|accumulator|pressure equipment|هیدرولیک|پنوماتیک|فرمان|سکان|آکومولاتور/.test(text)) return "hydraulic";
  if (/paint|oil|grease|coating|adhesive|sealant|resin|cleaning|descaling|rust remover|welding|electrode|welding wire|welding gases|grinding|sanding|abrasive|cutting disc|رنگ|روغن|گریس|پوشش|چسب|جوشکاری|سنباده/.test(text)) return "material";
  if (/marine bed|locker|chair|table|curtain|flooring|interior decoration|laundry|entertainment|sport equipment|accommodation|cabin|تخت|کمد|صندلی|پرده|کفپوش|کابین|اقامتی/.test(text)) return "accommodation";
  if (/galley|kitchen|sanitary|cooker|oven|stove|grill|warmer|آشپزخانه|بهداشتی|رفاهی|اجاق|فر/.test(text)) return "galley";
  if (/tool|test|calibr|workshop|jack|puller|chain block|hoist|ابزار|تست|کالیبراسیون|کارگاه|جک|بالابر/.test(text)) return "tool";
  if (/waste|sewage|environment|pollution|ows|ballast water treatment|spill response|incinerator|پسماند|فاضلاب|آلودگی|آب توازن|زباله‌سوز/.test(text)) return "environment";
  if (/hull|marine plate|profiles|beams|angles|channels|insulation|hatch|manhole|porthole|marine glass|ladders|stairs|rails|guards|shelves|racks|storage fixtures|بدنه|ورق|پروفیل|دریچه|پنجره|نردبان|نرده/.test(text)) return "hull";
  if (/industrial computer|server|storage|cctv|camera|nvr|surveillance|software|license|firmware|backup|data monitoring|شبکه|رایانه|دوربین|نرم‌افزار/.test(text)) return "computing";
  if (/sensor|transmitter|gauge|plc|control|i\/o|network module|expansion module|hmi|operator panel|load computer|stability calculation|tank gauging|positioner|limit switch|feedback unit|سنسور|ترانسمیتر|کنترل|گیج|نمایشگر/.test(text)) return "control";
  return "marine";
}
