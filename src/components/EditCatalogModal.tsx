"use client";
import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditCatalogModal({
  item,
  open,
  onClose,
  activeTab,
  onSave,
}: {
  item: any;
  open: boolean;
  onClose: () => void;
  activeTab: string;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        slug: item.slug || "",
        image_url: item.image_url || "",
        name_en: item.name_en || "",
        name_ru: item.name_ru || "",
        name_ky: item.name_ky || "",
        active: item.active !== false,
        // Tour specific
        price_usd: item.price_usd || "",
        duration_days: item.duration_days || "",
        difficulty: item.difficulty || "Moderate",
        // Hotel specific
        price_per_night: item.price_per_night || "",
        type: item.type || "hotel",
        location_en: item.location_en || "",
        location_ru: item.location_ru || "",
        location_ky: item.location_ky || "",
      });
    }
  }, [item]);

  if (!item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/${activeTab}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...formData }),
      });
      if (res.ok) {
        onSave();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred");
    } finally {
      setSaving(false);
    }
  }

  const isTour = activeTab === "tours";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(580px,calc(100vw-2rem))] max-h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-playfair text-xl font-bold">
                  {isTour ? "Редактировать тур" : "Редактировать отель"}
                </h3>
                <p className="text-white/60 text-xs mt-1">ID: #{item.id} — {item.slug}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Название (EN)</label>
                  <input
                    type="text"
                    required
                    value={formData.name_en || ""}
                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Название (RU)</label>
                  <input
                    type="text"
                    required
                    value={formData.name_ru || ""}
                    onChange={e => setFormData({ ...formData, name_ru: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Название (KY)</label>
                  <input
                    type="text"
                    required
                    value={formData.name_ky || ""}
                    onChange={e => setFormData({ ...formData, name_ky: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Slug (Уникальный ключ)</label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ""}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                  />
                </div>

                {isTour ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Цена ($ USD)</label>
                      <input
                        type="number"
                        required
                        value={formData.price_usd || ""}
                        onChange={e => setFormData({ ...formData, price_usd: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Количество дней</label>
                      <input
                        type="number"
                        required
                        value={formData.duration_days || ""}
                        onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Сложность</label>
                      <select
                        value={formData.difficulty || "Moderate"}
                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm font-bold text-slate-600 cursor-pointer"
                      >
                        <option value="Easy">Easy / Легкая</option>
                        <option value="Moderate">Moderate / Средняя</option>
                        <option value="Hard">Hard / Тяжелая</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Цена за ночь ($)</label>
                      <input
                        type="number"
                        required
                        value={formData.price_per_night || ""}
                        onChange={e => setFormData({ ...formData, price_per_night: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Тип жилья</label>
                      <select
                        value={formData.type || "hotel"}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm font-bold text-slate-600 cursor-pointer"
                      >
                        <option value="yurt">Yurt Camp / Юрты</option>
                        <option value="lodge">Mountain Lodge / Лодж</option>
                        <option value="hotel">Boutique Hotel / Отель</option>
                        <option value="guesthouse">Guesthouse / Гостевой дом</option>
                      </select>
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Регион (EN)</label>
                        <input
                          type="text"
                          value={formData.location_en || ""}
                          onChange={e => setFormData({ ...formData, location_en: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Регион (RU)</label>
                        <input
                          type="text"
                          value={formData.location_ru || ""}
                          onChange={e => setFormData({ ...formData, location_ru: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Регион (KY)</label>
                        <input
                          type="text"
                          value={formData.location_ky || ""}
                          onChange={e => setFormData({ ...formData, location_ky: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ссылка на изображение</label>
                  <input
                    type="url"
                    required
                    value={formData.image_url || ""}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#c9a84c] text-sm text-slate-850"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="item-active"
                    checked={formData.active || false}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-[#c9a84c] border-slate-350 focus:ring-[#c9a84c] rounded cursor-pointer"
                  />
                  <label htmlFor="item-active" className="text-sm font-bold text-slate-650 cursor-pointer select-none">
                    Активно для показа на сайте
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition font-bold text-sm cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0a0f14] text-white hover:bg-[#1a3d2b] transition font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Сохранить изменения
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
