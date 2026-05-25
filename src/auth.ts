import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

// Check if Google OAuth is properly configured
const hasGoogleAuth =
  !!process.env.AUTH_GOOGLE_ID &&
  !!process.env.AUTH_GOOGLE_SECRET &&
  !process.env.AUTH_GOOGLE_ID.startsWith("your-") &&
  process.env.AUTH_GOOGLE_ID !== "";

const providers: any[] = [];

if (hasGoogleAuth) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Always-on Credentials provider — works without Google OAuth setup.
// Accepts ANY email + password (no real check). Use for development/demo.
// First user to log in becomes admin automatically.
providers.push(
  Credentials({
    id: "demo",
    name: "Demo Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "you@example.com" },
      name: { label: "Name (optional)", type: "text" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) return null;
      const name = String(credentials?.name || email.split("@")[0]);
      return {
        id: email,
        email,
        name,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      } as any;
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/api/auth/signin", // use default page; works with credentials provider
  },
  providers,
  callbacks: {
    // signIn — creates DB row. First-ever user is auto-promoted to admin.
    async signIn({ user, account }) {
      if (!user?.email) return false;
      const provider = account?.provider ?? "demo";
      try {
        const { data: rows } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .limit(1);

        if (!rows || rows.length === 0) {
          // First user auto-becomes admin
          const { count } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });
          const isFirstUser = (count ?? 0) === 0;

          const { error } = await supabase.from("users").insert({
            name: user.name,
            email: user.email,
            image: user.image,
            google_id: provider === "google" ? user.id : null,
            role: isFirstUser ? "admin" : "user",
          });
          if (error) console.error("[auth signIn] insert error:", error.message);
        } else {
          const { error } = await supabase
            .from("users")
            .update({ name: user.name, image: user.image })
            .eq("email", user.email);
          if (error) console.error("[auth signIn] update error:", error.message);
        }
      } catch (e: any) {
        console.error("[auth signIn] unexpected:", e?.message ?? e);
      }
      return true;
    },

    // jwt — always re-fetches role from DB so admin role changes propagate
    // without requiring the user to log out and back in.
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      if (token?.email) {
        try {
          const { data: rows } = await supabase
            .from("users")
            .select("id, role")
            .eq("email", token.email as string)
            .limit(1);
          if (rows && rows.length > 0) {
            token.dbId = rows[0].id;
            token.role = rows[0].role;
          }
        } catch (e: any) {
          console.error("[auth jwt] DB lookup failed:", e?.message ?? e);
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token?.dbId ?? null;
        session.user.role = token?.role ?? "user";
      }
      return session;
    },
  },
});
