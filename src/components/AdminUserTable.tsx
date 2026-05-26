"use client";
import { useEffect, useState } from "react";
import {
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Users as UsersIcon,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  phone?: string;
  created_at: string;
  bookings_count: number;
};

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [working, setWorking] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function toggleRole(u: User) {
    setWorking(u.id);
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole as any } : x)));
      }
    } finally {
      setWorking(null);
    }
  }

  async function deleteUser(u: User) {
    if (!confirm(`Удалить пользователя ${u.email}? Это действие необратимо.`)) return;
    setWorking(u.id);
    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
      if (res.ok) setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } finally {
      setWorking(null);
    }
  }

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    return !s || u.email.toLowerCase().includes(s) || (u.name || "").toLowerCase().includes(s);
  });

  const totalAdmins = users.filter((u) => u.role === "admin").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black font-playfair text-slate-900">Зарегистрированные пользователи</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Всего {users.length} · {totalAdmins} админ{totalAdmins === 1 ? "" : totalAdmins < 5 ? "а" : "ов"}
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-slate-100 rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <UsersIcon className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">
            {users.length === 0 ? "Пока нет пользователей" : "Ничего не найдено"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 transition flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.image ? (
                  <img src={u.image} alt="" className="w-11 h-11 rounded-full border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8862a] text-[#0a0f14] flex items-center justify-center font-black text-lg shrink-0">
                    {(u.name || u.email)?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-slate-900 font-bold truncate">{u.name || "—"}</p>
                    {u.role === "admin" && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#c9a84c] text-[#0a0f14] px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Mail size={11} /> {u.email}
                    </span>
                    {u.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={11} /> {u.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Бронирований</p>
                  <p className="text-slate-900 font-bold">{u.bookings_count}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5 flex items-center gap-1">
                    <Calendar size={10} /> Регистрация
                  </p>
                  <p className="text-slate-900 font-bold">
                    {new Date(u.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 md:shrink-0">
                <button
                  onClick={() => toggleRole(u)}
                  disabled={working === u.id}
                  title={u.role === "admin" ? "Убрать админа" : "Сделать админом"}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition border ${
                    u.role === "admin"
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      : "bg-[#c9a84c]/10 text-[#a8862a] border-[#c9a84c]/30 hover:bg-[#c9a84c] hover:text-white"
                  } disabled:opacity-50`}
                >
                  {u.role === "admin" ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                  <span className="hidden sm:inline">{u.role === "admin" ? "Понизить" : "Повысить"}</span>
                </button>
                <button
                  onClick={() => deleteUser(u)}
                  disabled={working === u.id}
                  className="px-3 py-2 rounded-lg text-xs bg-white text-red-600 hover:bg-red-500 hover:text-white transition border border-slate-200 disabled:opacity-50"
                  title="Удалить пользователя"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
