"use client";
import { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Copy,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  ArrowUpDown,
  Inbox,
  Download,
} from "lucide-react";

type Booking = {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  item_type: string;
  tour_name?: string | null;
  hotel_name?: string | null;
  transport_title?: string | null;
  preferred_date: string;
  guests: number;
  status: string;
  special_requests?: string;
  created_at: string;
  price?: number | null;
};

export default function AdminBookingTable({
  initialBookings,
  translations,
}: {
  initialBookings: Booking[];
  translations: any;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function updateStatus(bookingId: number, newStatus: string) {
    setLoadingId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } finally {
      setLoadingId(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.full_name?.toLowerCase().includes(s) ||
          b.email?.toLowerCase().includes(s) ||
          b.phone?.toLowerCase().includes(s) ||
          (b.tour_name || b.hotel_name || b.transport_title || "")
            .toLowerCase()
            .includes(s) ||
          String(b.id).includes(s)
      );
    }
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((b) => b.item_type === typeFilter);
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortDesc ? tb - ta : ta - tb;
    });
    return list;
  }, [bookings, search, statusFilter, typeFilter, sortDesc]);

  const exportCSV = () => {
    const headers = ["id","type","client","email","phone","item","date","guests","price","status","created_at"];
    const rows = filtered.map((b) => [
      b.id, b.item_type, b.full_name, b.email, b.phone ?? "",
      b.tour_name || b.hotel_name || b.transport_title || "",
      b.preferred_date, b.guests, b.price ?? "", b.status, b.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl font-black font-playfair text-slate-900">Бронирования</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Показано {filtered.length} из {bookings.length}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, email, телефону..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <SelectPill
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Все статусы" },
              { value: "new", label: "Новые" },
              { value: "contacted", label: "В обработке" },
              { value: "confirmed", label: "Подтверждённые" },
              { value: "cancelled", label: "Отменённые" },
            ]}
          />
          <SelectPill
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "Все типы" },
              { value: "tour", label: "Туры" },
              { value: "hotel", label: "Отели" },
              { value: "transport", label: "Транспорт" },
            ]}
          />
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition"
          >
            <ArrowUpDown size={13} />
            {sortDesc ? "Сначала новые" : "Сначала старые"}
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2.5 rounded-lg bg-[#0a0f14] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#1a3d2b] transition"
          >
            <Download size={13} />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Inbox className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">Бронирований не найдено</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => {
            const isOpen = expandedId === b.id;
            const title = b.tour_name || b.hotel_name || b.transport_title || "—";
            return (
              <div
                key={b.id}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isOpen ? null : b.id)}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <StatusBadge status={b.status} translations={translations} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">#{b.id}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                          {translations[b.item_type] || b.item_type}
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold text-sm truncate">{b.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{b.email}</p>
                    </div>

                    <div className="hidden md:block min-w-0 max-w-xs flex-1">
                      <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-0.5">Услуга</p>
                      <p className="text-slate-700 font-bold text-sm truncate">{title}</p>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-0.5">Дата</p>
                      <p className="text-slate-700 font-bold text-sm whitespace-nowrap">
                        {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : "—"}
                      </p>
                    </div>

                    {b.price && (
                      <div className="hidden lg:block text-right">
                        <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-0.5">Сумма</p>
                        <p className="text-[#c9a84c] font-bold tabular-nums text-sm">
                          ${Math.round(Number(b.price) * (b.guests || 1))}
                        </p>
                      </div>
                    )}

                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <CopyChip icon={Mail} label={b.email} onClick={() => copyToClipboard(b.email)} copied={copied === b.email} />
                      {b.phone && (
                        <CopyChip icon={Phone} label={b.phone} onClick={() => copyToClipboard(b.phone!)} copied={copied === b.phone} />
                      )}
                      <a
                        href={`mailto:${b.email}?subject=Re: Бронирование #${b.id}`}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2 transition"
                      >
                        <Mail size={12} /> Написать
                      </a>
                      {b.phone && (
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9+]/g, "")}`}
                          target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2 transition"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      )}
                    </div>

                    {b.special_requests && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Особые пожелания</p>
                        <p className="text-slate-700 text-sm leading-relaxed">{b.special_requests}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <Detail label="Услуга" value={title} />
                      <Detail label="Дата" value={b.preferred_date ? new Date(b.preferred_date).toLocaleDateString("ru-RU") : "—"} />
                      <Detail label="Гостей" value={String(b.guests)} />
                      <Detail label="Создано" value={new Date(b.created_at).toLocaleString("ru-RU")} />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => updateStatus(b.id, "contacted")}
                        disabled={loadingId === b.id || b.status === "contacted"}
                        className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-white transition disabled:opacity-30"
                      >
                        <Clock size={13} /> В обработку
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "confirmed")}
                        disabled={loadingId === b.id || b.status === "confirmed"}
                        className="px-3 py-2 rounded-lg bg-[#c9a84c] text-[#0a0f14] text-xs font-bold flex items-center gap-2 hover:scale-105 transition disabled:opacity-30"
                      >
                        <CheckCircle size={13} /> Подтвердить
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        disabled={loadingId === b.id || b.status === "cancelled"}
                        className="px-3 py-2 rounded-lg bg-white text-red-600 border border-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition disabled:opacity-30"
                      >
                        <XCircle size={13} /> Отменить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, translations }: { status: string; translations: any }) {
  const cls =
    status === "confirmed" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : status === "cancelled" ? "bg-red-100 text-red-700 border-red-200"
    : status === "contacted" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-blue-100 text-blue-700 border-blue-200";
  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${cls}`}>
      {translations[`status_${status}`] || status}
    </span>
  );
}

function SelectPill({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg py-2.5 pl-3 pr-8 appearance-none focus:border-[#c9a84c] focus:outline-none cursor-pointer transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function CopyChip({ icon: Icon, label, onClick, copied }: { icon: any; label: string; onClick: () => void; copied: boolean; }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-2 transition"
    >
      <Icon size={12} />
      <span className="truncate max-w-[200px]">{label}</span>
      <Copy size={11} className={copied ? "text-emerald-600" : ""} />
      {copied && <span className="text-emerald-600 text-[10px]">скопировано!</span>}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-slate-700 font-medium">{value}</p>
    </div>
  );
}
