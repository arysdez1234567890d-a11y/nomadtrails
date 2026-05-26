"use client";
import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Send, Search, Inbox } from "lucide-react";

type Msg = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesTable() {
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function markRead(m: Msg, is_read: boolean) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, is_read }),
    });
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read } : x)));
  }

  async function remove(m: Msg) {
    if (!confirm(`Удалить сообщение от ${m.email}?`)) return;
    await fetch(`/api/admin/messages?id=${m.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    if (openId === m.id) setOpenId(null);
  }

  const filtered = items.filter((m) => {
    if (filter === "unread" && m.is_read) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.email.toLowerCase().includes(s) ||
      m.name.toLowerCase().includes(s) ||
      (m.subject || "").toLowerCase().includes(s) ||
      m.message.toLowerCase().includes(s)
    );
  });

  const unreadCount = items.filter((m) => !m.is_read).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black font-playfair text-slate-900">Контактные сообщения</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Всего {items.length} · {unreadCount} непрочитано
          </p>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Непрочитанные {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#c9a84c] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-slate-100 rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Inbox className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">
            {items.length === 0 ? "Пока нет сообщений" : "Ничего не найдено"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const isOpen = openId === m.id;
            return (
              <div
                key={m.id}
                className={`border rounded-xl overflow-hidden transition ${
                  m.is_read
                    ? "bg-white border-slate-200"
                    : "bg-amber-50/30 border-[#c9a84c]/30"
                }`}
              >
                <div
                  className="p-4 cursor-pointer flex items-start gap-3"
                  onClick={() => {
                    setOpenId(isOpen ? null : m.id);
                    if (!m.is_read) markRead(m, true);
                  }}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      m.is_read ? "bg-slate-100 text-slate-400" : "bg-[#c9a84c]/20 text-[#a8862a]"
                    }`}
                  >
                    {m.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className={`font-bold truncate ${m.is_read ? "text-slate-700" : "text-slate-900"}`}>
                        {m.name}
                      </p>
                      {!m.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />}
                      <span className="text-xs text-slate-400">{m.email}</span>
                    </div>
                    <p className={`text-sm truncate ${m.is_read ? "text-slate-500" : "text-slate-700"}`}>
                      {m.subject ? <strong>{m.subject} — </strong> : null}
                      {m.message}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-widest">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {isOpen && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-3">
                    {m.subject && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Тема</p>
                        <p className="text-slate-900">{m.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Сообщение</p>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{m.message}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "")}`}
                        className="px-3 py-2 bg-[#c9a84c] text-[#0a0f14] rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition"
                      >
                        <Send size={13} /> Ответить
                      </a>
                      <button
                        onClick={() => markRead(m, !m.is_read)}
                        className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition"
                      >
                        {m.is_read ? <Mail size={13} /> : <MailOpen size={13} />}
                        {m.is_read ? "Сделать непрочитанным" : "Прочитано"}
                      </button>
                      <button
                        onClick={() => remove(m)}
                        className="px-3 py-2 bg-white text-red-600 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
                      >
                        <Trash2 size={13} /> Удалить
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
