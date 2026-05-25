"use client";
import { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Search,
  Filter,
  Copy,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  ArrowUpDown,
  DollarSign,
  Inbox,
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
    const headers = [
      "id",
      "type",
      "client",
      "email",
      "phone",
      "item",
      "date",
      "guests",
      "price",
      "status",
      "created_at",
    ];
    const rows = filtered.map((b) => [
      b.id,
      b.item_type,
      b.full_name,
      b.email,
      b.phone ?? "",
      b.tour_name || b.hotel_name || b.transport_title || "",
      b.preferred_date,
      b.guests,
      b.price ?? "",
      b.status,
      b.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, item..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <SelectPill
            icon={Filter}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All status" },
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "confirmed", label: "Confirmed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <SelectPill
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All types" },
              { value: "tour", label: "Tours" },
              { value: "hotel", label: "Hotels" },
              { value: "transport", label: "Transport" },
            ]}
          />
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition"
          >
            <ArrowUpDown size={14} />
            {sortDesc ? "Newest" : "Oldest"}
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-3 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-bold flex items-center gap-2 hover:bg-[#c9a84c] hover:text-[#1a3d2b] transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-white/40 mb-4">
        Showing {filtered.length} of {bookings.length} bookings
      </p>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
          <Inbox className="mx-auto text-white/20 mb-4" size={40} />
          <p className="text-white/30 font-black uppercase tracking-widest text-xs">
            No bookings match your filters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isOpen = expandedId === b.id;
            const title =
              b.tour_name || b.hotel_name || b.transport_title || "—";
            return (
              <div
                key={b.id}
                className="bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isOpen ? null : b.id)}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Status badge */}
                    <StatusBadge status={b.status} translations={translations} />

                    {/* Client */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] text-white/30 font-black tracking-widest uppercase">
                          #{b.id}
                        </span>
                        <span className="text-[9px] bg-white/5 text-[#c9a84c] px-2 py-0.5 rounded-full uppercase font-black tracking-widest border border-white/10">
                          {translations[b.item_type] || b.item_type}
                        </span>
                      </div>
                      <p className="text-white font-bold truncate">{b.full_name}</p>
                      <p className="text-xs text-white/40 truncate">{b.email}</p>
                    </div>

                    {/* Item */}
                    <div className="hidden md:block min-w-0 max-w-xs flex-1">
                      <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">
                        Item
                      </p>
                      <p className="text-white/80 font-bold truncate">{title}</p>
                    </div>

                    {/* Date */}
                    <div className="hidden md:block">
                      <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">
                        Date
                      </p>
                      <p className="text-white/80 font-bold text-sm whitespace-nowrap">
                        {b.preferred_date
                          ? new Date(b.preferred_date).toLocaleDateString()
                          : "—"}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {b.guests} {translations.guests}
                      </p>
                    </div>

                    {/* Price */}
                    {b.price && (
                      <div className="hidden lg:block text-right">
                        <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">
                          Total
                        </p>
                        <p className="text-[#c9a84c] font-bold tabular-nums">
                          ${Math.round(Number(b.price) * (b.guests || 1))}
                        </p>
                      </div>
                    )}

                    {/* Toggle */}
                    <ChevronDown
                      size={18}
                      className={`text-white/40 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="bg-black/30 border-t border-white/10 p-5 space-y-4">
                    {/* Contact actions */}
                    <div className="flex flex-wrap gap-2">
                      <CopyChip
                        icon={Mail}
                        label={b.email}
                        onClick={() => copyToClipboard(b.email)}
                        copied={copied === b.email}
                      />
                      {b.phone && (
                        <CopyChip
                          icon={Phone}
                          label={b.phone}
                          onClick={() => copyToClipboard(b.phone!)}
                          copied={copied === b.phone}
                        />
                      )}
                      <a
                        href={`mailto:${b.email}?subject=Re: Booking #${b.id}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold border border-white/10 flex items-center gap-2 transition"
                      >
                        <Mail size={12} /> Email
                      </a>
                      {b.phone && (
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9+]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-2 transition"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      )}
                    </div>

                    {b.special_requests && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Special requests
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {b.special_requests}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <Detail label="Item" value={title} />
                      <Detail
                        label="Date"
                        value={
                          b.preferred_date
                            ? new Date(b.preferred_date).toLocaleDateString()
                            : "—"
                        }
                      />
                      <Detail label="Guests" value={String(b.guests)} />
                      <Detail
                        label="Created"
                        value={new Date(b.created_at).toLocaleString()}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => updateStatus(b.id, "contacted")}
                        disabled={loadingId === b.id || b.status === "contacted"}
                        className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-white transition disabled:opacity-30"
                      >
                        <Clock size={14} /> Mark contacted
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "confirmed")}
                        disabled={loadingId === b.id || b.status === "confirmed"}
                        className="px-4 py-2 rounded-xl bg-[#c9a84c] text-[#1a3d2b] text-xs font-bold flex items-center gap-2 hover:scale-105 transition disabled:opacity-30"
                      >
                        <CheckCircle size={14} /> {translations.action_confirm}
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        disabled={loadingId === b.id || b.status === "cancelled"}
                        className="px-4 py-2 rounded-xl bg-white/5 text-red-400 border border-white/10 text-xs font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition disabled:opacity-30"
                      >
                        <XCircle size={14} /> {translations.action_cancel}
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
    status === "confirmed"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : status === "cancelled"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : status === "contacted"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return (
    <span
      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${cls}`}
    >
      {translations[`status_${status}`] || status}
    </span>
  );
}

function SelectPill({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon?: any;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl py-3 ${
          Icon ? "pl-9" : "pl-3"
        } pr-8 appearance-none focus:border-[#c9a84c] focus:outline-none cursor-pointer transition`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
    </div>
  );
}

function CopyChip({
  icon: Icon,
  label,
  onClick,
  copied,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  copied: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium border border-white/10 flex items-center gap-2 transition"
    >
      <Icon size={12} />
      <span className="truncate max-w-[200px]">{label}</span>
      <Copy size={11} className={copied ? "text-emerald-400" : ""} />
      {copied && <span className="text-emerald-400 text-[10px]">copied!</span>}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
        {label}
      </p>
      <p className="text-white/80 font-medium">{value}</p>
    </div>
  );
}
