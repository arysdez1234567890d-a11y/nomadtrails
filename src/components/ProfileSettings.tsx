"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Save, Check, Phone, Mail, Calendar, ShieldCheck } from "lucide-react";

const PRESET_AVATARS = [
  { id: "nomad", label: "Nomad Explorer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" },
  { id: "hiker", label: "Mountain Hiker", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: "backpacker", label: "Backpacker", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop" },
  { id: "guide", label: "Alpine Guide", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop" },
  { id: "photographer", label: "Nature Photographer", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop" },
  { id: "ranger", label: "Wildlife Ranger", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop" },
  { id: "guitarist", label: "Campfire Guitarist", url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop" },
  { id: "climber", label: "Summit Climber", url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop" },
];

export default function ProfileSettings({
  initialUser,
  translations,
}: {
  initialUser: any;
  translations: any;
}) {
  const router = useRouter();
  const { update } = useSession();
  
  const [name, setName] = useState(initialUser?.name || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [avatar, setAvatar] = useState(initialUser?.image || "");
  
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
        body: JSON.stringify({ name, phone, image: avatar }),
      });
      if (res.ok) {
        setSaved(true);
        // Refresh next-auth session token
        if (update) {
          await update();
        }
        // Refresh Next.js server components
        router.refresh();
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
      <section className="bg-gradient-to-br from-[#f0f7f4] to-white border border-gray-100 rounded-2xl p-6 shadow-sm">
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
      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Edit your details
        </h3>

        {/* Avatar Preset Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700">
            Choose traveler avatar
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {PRESET_AVATARS.map((av) => {
              const isSelected = avatar === av.url;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.url)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isSelected ? "border-[#c9a84c] shadow-lg shadow-[#c9a84c]/20" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#1a3d2b]/20 flex items-center justify-center">
                      <span className="bg-[#c9a84c] text-[#1a3d2b] w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        <Check size={14} className="stroke-[3]" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
              saved ? "bg-emerald-600 text-white" : "bg-[#1a3d2b] text-white hover:bg-[#2d5a42]"
            } disabled:opacity-50`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
