"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Map } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ToursManager() {
  const { locale } = useParams() as { locale: string };
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  async function fetchTours() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tours");
      const data = await res.json();
      setTours(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить тур?")) return;
    const res = await fetch(`/api/admin/tours?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchTours();
  }

  const filtered = tours.filter(
    (t) =>
      t.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black font-playfair text-slate-900">
              Управление турами
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Всего {tours.length} тур{tours.length === 1 ? "" : "ов"}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/tours/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a0f14] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#1a3d2b] transition shadow-sm"
          >
            <Plus size={14} strokeWidth={3} /> Добавить тур
          </Link>
        </div>

        <div className="relative max-w-md mb-6">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или slug..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 transition"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-slate-100 rounded-xl p-4 animate-pulse h-24"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <Map className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm font-medium text-slate-500">
              {tours.length === 0 ? "Туров пока нет" : "Ничего не найдено"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
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
                    <h3 className="font-bold text-slate-900 text-base truncate">
                      {t[`name_${locale}`] || t.name_en}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {t.slug}
                      </span>
                      <span className="text-sm font-bold text-[#c9a84c]">
                        ${t.price_usd}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t.duration_days} дн
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          t.difficulty === "Easy"
                            ? "bg-emerald-100 text-emerald-700"
                            : t.difficulty === "Hard"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-[#c9a84c] hover:text-white border border-slate-200 flex items-center justify-center transition"
                    title="Редактировать"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white border border-slate-200 flex items-center justify-center transition"
                    title="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
