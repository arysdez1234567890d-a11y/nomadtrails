"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Map,
  Hotel,
  Users,
  Mail,
  Plus,
  Trash2,
  Edit,
  Activity,
} from "lucide-react";
import AdminBookingTable from "./AdminBookingTable";
import AdminUserTable from "./AdminUserTable";
import AdminMessagesTable from "./AdminMessagesTable";
import AdminActivityFeed from "./AdminActivityFeed";

type Tab = "activity" | "bookings" | "tours" | "hotels" | "users" | "messages";

export default function AdminTabs({
  initialBookings,
  translations,
  locale,
}: any) {
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "tours" || activeTab === "hotels") {
      fetchItems();
    }
  }, [activeTab]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm(translations.confirm_delete)) return;
    try {
      const res = await fetch(`/api/admin/${activeTab}?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error(err);
    }
  }

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "activity", icon: Activity, label: "Activity" },
    { id: "bookings", icon: Calendar, label: translations.tab_bookings },
    { id: "tours", icon: Map, label: translations.tab_tours },
    { id: "hotels", icon: Hotel, label: translations.tab_hotels },
    { id: "users", icon: Users, label: translations.tab_users },
    { id: "messages", icon: Mail, label: translations.tab_messages },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-3xl min-h-[600px]">
      {/* Tab bar */}
      <div className="flex border-b border-white/5 overflow-x-auto bg-white/5 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 md:px-8 py-5 font-bold transition-all border-b-2 whitespace-nowrap text-xs uppercase tracking-[0.2em] ${
              activeTab === tab.id
                ? "border-[#c9a84c] text-[#c9a84c] bg-white/5"
                : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "activity" && <AdminActivityFeed />}

      {activeTab === "bookings" && (
        <AdminBookingTable
          initialBookings={initialBookings}
          translations={translations}
        />
      )}

      {activeTab === "users" && <AdminUserTable />}

      {activeTab === "messages" && <AdminMessagesTable />}

      {(activeTab === "tours" || activeTab === "hotels") && (
        <CrudPanel
          title={
            activeTab === "tours"
              ? translations.tab_tours
              : translations.tab_hotels
          }
          loading={loading}
          items={items}
          locale={locale}
          translations={translations}
          onDelete={deleteItem}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}

function CrudPanel({
  title,
  loading,
  items,
  locale,
  translations,
  onDelete,
  activeTab,
}: any) {
  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-playfair text-white mb-1">
            {title}
          </h2>
          <div className="h-0.5 w-12 bg-[#c9a84c] rounded-full" />
        </div>
        {activeTab === "tours" && (
          <a
            href={`/${locale}/admin/tours/new`}
            className="px-6 py-3 bg-[#c9a84c] text-[#1a3d2b] font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-[#c9a84c]/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> {translations.add_new}
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-24"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
          <p className="text-white/30 font-black uppercase tracking-widest text-xs">
            {translations.no_items}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="group bg-white/5 hover:bg-white/[0.08] border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Map size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-lg leading-tight truncate font-playfair">
                    {item[`name_${locale}`] || item.name_en}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {item.slug}
                    </span>
                    <span className="text-sm font-black text-[#c9a84c]">
                      ${item.price_usd || item.price_per_night}
                    </span>
                    {item.duration_days && (
                      <span className="text-xs text-white/40">
                        {item.duration_days} days
                      </span>
                    )}
                    {item.type && (
                      <span className="text-xs text-white/40 capitalize">{item.type}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-[#c9a84c] hover:text-[#1a3d2b] border border-white/10 flex items-center justify-center transition"
                  title="Edit (coming soon)"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-red-500 hover:text-white border border-white/10 flex items-center justify-center transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
