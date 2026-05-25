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

  useEffect(() => {
    load();
  }, []);

  async function markRead(m: Msg, is_read: boolean) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, is_read }),
    });
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read } : x)));
  }

  async function remove(m: Msg) {
    if (!confirm(`Delete message from ${m.email}?`)) return;
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
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-playfair text-white mb-1">
            Contact Messages
          </h2>
          <p className="text-emerald-400/40 text-xs uppercase tracking-widest font-bold">
            {items.length} total · {unreadCount} unread
          </p>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                filter === "all" ? "bg-white/10 text-white" : "text-white/40"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                filter === "unread" ? "bg-white/10 text-white" : "text-white/40"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-16"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
          <Inbox className="mx-auto text-white/20 mb-4" size={40} />
          <p className="text-white/30 font-black uppercase tracking-widest text-xs">
            {items.length === 0 ? "No messages yet" : "No matches"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const isOpen = openId === m.id;
            return (
              <div
                key={m.id}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  m.is_read
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-[#c9a84c]/[0.05] border-[#c9a84c]/30"
                }`}
              >
                <div
                  className="p-4 cursor-pointer flex items-start gap-4"
                  onClick={() => {
                    setOpenId(isOpen ? null : m.id);
                    if (!m.is_read) markRead(m, true);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      m.is_read ? "bg-white/5 text-white/40" : "bg-[#c9a84c]/20 text-[#c9a84c]"
                    }`}
                  >
                    {m.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={`font-bold truncate ${m.is_read ? "text-white/70" : "text-white"}`}>
                        {m.name}
                      </p>
                      {!m.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                      )}
                      <span className="text-xs text-white/30">{m.email}</span>
                    </div>
                    <p className={`text-sm truncate ${m.is_read ? "text-white/40" : "text-white/70"}`}>
                      {m.subject ? <strong>{m.subject} — </strong> : null}
                      {m.message}
                    </p>
                  </div>

                  <span className="text-[10px] text-white/30 shrink-0 uppercase tracking-widest">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {isOpen && (
                  <div className="bg-black/30 border-t border-white/10 p-5 space-y-4">
                    {m.subject && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Subject
                        </p>
                        <p className="text-white">{m.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                        Message
                      </p>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {m.message}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "")}`}
                        className="px-4 py-2 bg-[#c9a84c] text-[#1a3d2b] rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Send size={14} /> Reply via email
                      </a>
                      <button
                        onClick={() => markRead(m, !m.is_read)}
                        className="px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                      >
                        {m.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                        Mark {m.is_read ? "unread" : "read"}
                      </button>
                      <button
                        onClick={() => remove(m)}
                        className="px-4 py-2 bg-white/5 text-red-400 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} /> Delete
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
