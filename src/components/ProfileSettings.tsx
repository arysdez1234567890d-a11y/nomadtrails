"use client";
import { useState } from "react";
import { User, Save, Check, Phone, Mail, Calendar, ShieldCheck } from "lucide-react";

export default function ProfileSettings({
  initialUser,
  translations,
}: {
  initialUser: any;
  translations: any;
}) {
  const [name, setName] = useState(initialUser?.name || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Account info card */}
      <section className="bg-gradient-to-br from-[#f0f7f4] to-white border border-gray-100 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Account information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Email" value={initialUser?.email ?? "—"} />
          <InfoRow icon={User} label="Display name" value={initialUser?.name ?? "—"} />
          <InfoRow
            icon={Calendar}
            label="Member since"
            value={
              initialUser?.created_at
                ? new Date(initialUser.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            icon={ShieldCheck}
            label="Role"
            value={
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  initialUser?.role === "admin"
                    ? "bg-[#c9a84c] text-[#1a3d2b]"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {initialUser?.role ?? "user"}
              </span>
            }
          />
        </div>
      </section>

      {/* Editable form */}
      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Edit your details
        </h3>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {translations.full_name}
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {translations.phone_number}
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 ..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
              saved ? "bg-emerald-600 text-white" : "bg-[#1a3d2b] text-white hover:bg-[#2d5a42]"
            } disabled:opacity-50`}
          >
            {loading ? (
              "..."
            ) : saved ? (
              <>
                <Check size={18} /> {translations.saved}
              </>
            ) : (
              <>
                <Save size={18} /> {translations.save_changes}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#1a3d2b] shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-gray-800 break-all">{value}</div>
      </div>
    </div>
  );
}
