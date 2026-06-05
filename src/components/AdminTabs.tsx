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
  X,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminBookingTable from "./AdminBookingTable";
import AdminUserTable from "./AdminUserTable";
import AdminMessagesTable from "./AdminMessagesTable";
import AdminActivityFeed from "./AdminActivityFeed";
import EditCatalogModal from "./EditCatalogModal";

type Tab = "activity" | "bookings" | "tours" | "hotels" | "users" | "messages";

export default function AdminTabs({
  initialBookings,
  translations,
  locale,
}: any) {
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

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
    { id: "activity", icon: Activity, label: "Активность" },
    { id: "bookings", icon: Calendar, label: translations.tab_bookings },
    { id: "tours", icon: Map, label: translations.tab_tours },
    { id: "hotels", icon: Hotel, label: translations.tab_hotels },
    { id: "users", icon: Users, label: translations.tab_users },
    { id: "messages", icon: Mail, label: translations.tab_messages },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 font-bold transition-all border-b-2 whitespace-nowrap text-xs uppercase tracking-[0.15em] cursor-pointer ${
              activeTab === tab.id
                ? "border-[#c9a84c] text-[#0a0f14] bg-white"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-white"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white">
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
            onEdit={setEditingItem}
            activeTab={activeTab}
          />
        )}
      </div>

      {/* Edit Item Modal */}
      <EditCatalogModal
        item={editingItem}
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        activeTab={activeTab}
        onSave={() => {
          setEditingItem(null);
          fetchItems();
        }}
      />
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
  onEdit,
  activeTab,
}: any) {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black font-playfair text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Управление каталогом
          </p>
        </div>
        {activeTab === "tours" && (
          <a
            href={`/${locale}/admin/tours/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a0f14] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#1a3d2b] transition shadow-sm"
          >
            <Plus size={14} strokeWidth={3} /> {translations.add_new}
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-xl p-4 animate-pulse h-20"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium text-sm">{translations.no_items}</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="group bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Map size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                    {item[`name_${locale}`] || item.name_en}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.slug}
                    </span>
                    <span className="text-sm font-bold text-[#c9a84c]">
                      ${item.price_usd || item.price_per_night}
                    </span>
                    {item.duration_days && (
                      <span className="text-xs text-slate-500">
                        {item.duration_days} days
                      </span>
                    )}
                    {item.type && (
                      <span className="text-xs text-slate-500 capitalize">{item.type}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-[#c9a84c] hover:text-white border border-slate-200 flex items-center justify-center transition cursor-pointer"
                  title="Edit"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white border border-slate-200 flex items-center justify-center transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// EditCatalogModal is now imported from "./EditCatalogModal"
