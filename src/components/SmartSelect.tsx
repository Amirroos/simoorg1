import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface SingleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
}

export function SingleSelect({ value, onChange, options, placeholder = "انتخاب کنید" }: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useOutsideClose(() => setOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="input-shell w-full flex items-center justify-between gap-3 text-right"
      >
        <span className={value ? "text-slate-800 font-semibold truncate" : "text-slate-400"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[110] mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
          <div className="max-h-64 overflow-y-auto pr-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  value === option ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{option}</span>
                {value === option && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MultiSelect({ values, onChange, options, placeholder = "انتخاب کنید" }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useOutsideClose(() => setOpen(false));

  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="input-shell w-full min-h-[46px] flex items-center justify-between gap-3 text-right"
      >
        <span className={values.length ? "text-slate-800 font-semibold truncate" : "text-slate-400"}>
          {values.length ? `${values.length.toLocaleString("fa-IR")} مورد انتخاب شد` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-700">
              {value}
              <button type="button" onClick={() => toggle(value)} className="rounded-full hover:bg-cyan-100 p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-[110] mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
          <div className="max-h-64 overflow-y-auto pr-1">
            {options.map((option) => {
              const active = values.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${active ? "bg-cyan-600 border-cyan-600 text-white" : "border-slate-300"}`}>
                    {active && <Check className="w-3 h-3" />}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function useOutsideClose(onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onClose]);

  return rootRef;
}
