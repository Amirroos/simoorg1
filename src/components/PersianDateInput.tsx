import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addPersianMonths,
  formatPersianDateParts,
  getPersianMonthLength,
  getPersianMonthStartWeekday,
  isSamePersianDate,
  normalizePersianDateInput,
  parsePersianDate,
  persianMonthNames,
  persianWeekdayNames,
  todayPersian,
  todayPersianParts,
  toPersianDigits,
  type PersianDateParts,
} from "../utils/persianDate";

interface PersianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function PersianDateInput({ value, onChange, className = "", required }: PersianDateInputProps) {
  const [open, setOpen] = useState(false);
  const selected = parsePersianDate(value);
  const [viewDate, setViewDate] = useState<PersianDateParts>(selected || todayPersianParts());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextSelected = parsePersianDate(value);
    if (nextSelected) setViewDate(nextSelected);
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const monthLength = getPersianMonthLength(viewDate.year, viewDate.month);
  const startWeekday = getPersianMonthStartWeekday(viewDate.year, viewDate.month);
  const today = todayPersianParts();
  const cells = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: monthLength }, (_, index) => index + 1),
  ];

  const chooseDay = (day: number) => {
    onChange(formatPersianDateParts({ year: viewDate.year, month: viewDate.month, day }));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => onChange(normalizePersianDateInput(event.target.value))}
        dir="ltr"
        inputMode="numeric"
        placeholder={todayPersian()}
        required={required}
        className={`${className || "input-shell"} pr-10 text-left`}
      />

      {open && (
        <div className="absolute z-[120] mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 left-0">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate((current) => addPersianMonths(current, -1))}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="font-black text-slate-900">
                {persianMonthNames[viewDate.month - 1]} {toPersianDigits(viewDate.year)}
              </div>
              <button
                type="button"
                onClick={() => setViewDate(todayPersianParts())}
                className="text-[11px] font-bold text-cyan-700 hover:underline"
              >
                امروز
              </button>
            </div>
            <button
              type="button"
              onClick={() => setViewDate((current) => addPersianMonths(current, 1))}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {persianWeekdayNames.map((day) => (
              <div key={day} className="text-[11px] font-black text-slate-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              const currentDate = day ? { year: viewDate.year, month: viewDate.month, day } : null;
              const selectedDay = isSamePersianDate(selected, currentDate);
              const todayDay = isSamePersianDate(today, currentDate);

              return day ? (
                <button
                  key={`${viewDate.year}-${viewDate.month}-${day}`}
                  type="button"
                  onClick={() => chooseDay(day)}
                  className={`h-9 rounded-xl text-sm font-bold transition ${
                    selectedDay
                      ? "bg-cyan-600 text-white shadow-sm"
                      : todayDay
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              ) : (
                <div key={`empty-${index}`} className="h-9" />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
