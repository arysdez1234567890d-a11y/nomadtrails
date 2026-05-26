"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Map,
  Calendar,
  Mail,
  Mountain,
  Home,
  LogOut,
  Menu,
  X,
  Users,
  Bell,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: `/${locale}/admin` },
    { label: "Bookings", icon: Calendar, href: `/${locale}/admin/bookings` },
    { label: "Tours", icon: Map, href: `/${locale}/admin/tours` },
    { label: "Users", icon: Users, href: `/${locale}/admin/users` },
    { label: "Messages", icon: Mail, href: `/${locale}/admin/messages` },
  ];

  async function handleLogout() {
    await signOut({ redirect: false });
    window.location.href = `/${locale}`;
  }

  const initials = (session?.user?.name || "A").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0a0f14] text-slate-300 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#a8862a] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
              <Mountain className="text-[#0a0f14]" size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-playfair font-black text-base text-white leading-tight">
                NOMADTRAILS
              </div>
              <div className="text-[9px] tracking-[0.3em] text-[#c9a84c]/80 font-bold uppercase">
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 mb-3 mt-2">
            Workspace
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#c9a84c]/10 text-[#c9a84c] shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-[#c9a84c]" : "text-slate-500 group-hover:text-white"}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer in sidebar */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ExternalLink size={16} />
            <span>View Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden sm:block">
                  Management Center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                title="Notifications"
              >
                <Bell size={18} />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8862a] text-[#0a0f14] flex items-center justify-center text-xs font-black">
                      {initials}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {(session?.user as any)?.role === "admin" ? "Administrator" : "User"}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20">
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      <div className="p-1">
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Home size={14} /> Profile page
                        </Link>
                        <Link
                          href={`/${locale}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ExternalLink size={14} /> View website
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
