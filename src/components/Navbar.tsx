"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, ChevronDown, User, LogOut, ShieldCheck, Map } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import SignInModal from "./SignInModal";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ky", label: "Кыргызча", flag: "🇰🇬" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(true);

  useEffect(() => {
    // Check which providers are configured (call NextAuth API)
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setHasGoogle(!!p?.google))
      .catch(() => setHasGoogle(false));
  }, []);

  async function handleLogout() {
    setUserMenuOpen(false);
    setMenuOpen(false);
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error("Logout error:", e);
    }
    // Hard reload to clear ALL client-side cached state
    window.location.href = `/${currentLocale}`;
  }

  const currentLocale = pathname.split("/")[1] || "en";
  const currentLang = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];
  const isHome = pathname === `/${currentLocale}` || pathname === `/${currentLocale}/` || pathname === "/";
  const forceScrolled = scrolled || !isHome;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function switchLocale(code: string) {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/") || "/");
    setLangOpen(false);
  }

  const navLinks = [
    { href: `/${currentLocale}#destinations`, label: t("destinations") },
    { href: `/${currentLocale}#tours`, label: t("tours") },
    { href: `/${currentLocale}#hotels`, label: t("hotels") },
    { href: `/${currentLocale}#transport`, label: t("transport") },
    { href: `/${currentLocale}#contact`, label: t("contact") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        forceScrolled ? "bg-white/90 backdrop-blur-xl shadow-lg py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${currentLocale}`} className="flex items-center gap-4 group">
          <div className="relative w-12 h-12 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl group-hover:rotate-6 transition-transform duration-500" />
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="relative z-10 w-10 h-10 object-contain rounded-xl shadow-2xl" 
            />
          </div>
          <div>
            <span className={`font-playfair font-extrabold text-xl transition-colors ${forceScrolled ? "text-[#0d1117]" : "text-white"}`}>{tc("site_name")}</span>
            <span className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${forceScrolled ? "text-[#40916c]" : "text-[#c9a84c]"}`}>{tc("site_tagline")}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`text-sm font-bold tracking-wide transition-all hover:text-[#c9a84c] ${forceScrolled ? "text-gray-600" : "text-white/90"}`}>
              {link.label}
            </a>
          ))}

          {/* User & Lang */}
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${forceScrolled ? "bg-gray-100 text-[#1a3d2b]" : "bg-white/10 text-white hover:bg-white/20"}`}>
                <Globe size={14} />
                <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-3 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[160px] border border-gray-100 p-1">
                    {LOCALES.map((l) => (
                      <button key={l.code} onClick={() => switchLocale(l.code)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all ${l.code === currentLocale ? "bg-[#1a3d2b] text-white" : "hover:bg-gray-50 text-gray-700"}`}>
                        <span className="text-lg">{l.flag}</span>
                        <span className="font-bold">{l.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              {session ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center transition-transform hover:scale-110">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className={`w-10 h-10 rounded-full border-2 ${forceScrolled ? "border-[#1a3d2b]" : "border-white"}`} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#c9a84c] text-white flex items-center justify-center font-bold">{session.user?.name?.[0]}</div>
                  )}
                </button>
              ) : (
                <button onClick={() => setSignInOpen(true)} className={`btn-primary !py-2.5 !px-6 !text-[11px]`}>
                  <User size={14} className="mr-2" />
                  {t("login")}
                </button>
              )}
              <AnimatePresence>
                {userMenuOpen && session && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute top-full mt-4 right-0 bg-white rounded-2xl shadow-2xl p-2 min-w-[220px] border border-gray-100">
                    {(session.user as any).role === 'admin' && (
                      <Link href={`/${currentLocale}/admin`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1a3d2b] hover:bg-[#f0f7f4] transition-all font-bold text-sm mb-1 border-b border-gray-50">
                        <ShieldCheck size={18} className="text-[#c9a84c]" /> Admin Panel
                      </Link>
                    )}
                    <Link href={`/${currentLocale}/profile`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm">
                      <User size={18} /> {t("profile")}
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-1">
                      <LogOut size={18} /> {t("logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* Mobile Buttons */}
        <div className="flex lg:hidden items-center gap-4">
          {session && (
             <Link href={`/${currentLocale}/profile`} className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#c9a84c]">
                {session.user?.image ? <img src={session.user.image} alt="" /> : <div className="bg-[#c9a84c] text-white w-full h-full flex items-center justify-center font-bold">{session.user?.name?.[0]}</div>}
             </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 transition-colors ${forceScrolled ? "text-[#1a3d2b]" : "text-white"}`}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-[999] bg-white flex flex-col lg:hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
               <span className="font-playfair font-black text-2xl text-[#1a3d2b]">Menu</span>
               <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.a initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-3xl font-playfair font-bold text-[#1a3d2b] flex items-center justify-between">
                  {link.label} <ChevronDown className="-rotate-90 text-[#c9a84c]" />
                </motion.a>
              ))}
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Language</p>
                <div className="flex flex-wrap gap-3">
                  {LOCALES.map((l) => (
                    <button key={l.code} onClick={() => { switchLocale(l.code); setMenuOpen(false); }} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${l.code === currentLocale ? "bg-[#1a3d2b] border-[#1a3d2b] text-white" : "border-gray-100 text-gray-500"}`}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 bg-gray-50">
              {!session ? (
                <button onClick={() => { setSignInOpen(true); setMenuOpen(false); }} className="btn-primary w-full py-5">
                  <User className="mr-3" /> {t("login")}
                </button>
              ) : (
                <button onClick={handleLogout} className="w-full py-5 text-red-500 font-bold flex items-center justify-center gap-2">
                  <LogOut /> {t("logout")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} hasGoogle={hasGoogle} />
    </header>
  );
}

