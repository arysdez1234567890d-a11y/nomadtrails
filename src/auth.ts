import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// Detect if Google OAuth is properly configured
const hasGoogleAuth =
  !!process.env.AUTH_GOOGLE_ID &&
  !!process.env.AUTH_GOOGLE_SECRET &&
  !process.env.AUTH_GOOGLE_ID.startsWith("your-") &&
  process.env.AUTH_GOOGLE_ID.length > 0;

const providers: any[] = [];

if (hasGoogleAuth) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Email + password login. Returns user from DB if credentials valid.
providers.push(
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      const email = String(creds?.email || "").trim().toLowerCase();
      const password = String(creds?.password || "");
      if (!email || !email.includes("@") || !password) return null;

      try {
        const { data: rows, error } = await supabase
          .from("users")
          .select("id, name, email, image, role, password_hash")
          .eq("email", email)
          .limit(1);

        if (error || !rows || rows.length === 0) return null;
        const u = rows[0] as any;

        if (!u.password_hash) return null; // user has no password set
        const ok = await bcrypt.compare(password, u.password_hash);
        if (!ok) return null;

        return {
          id: String(u.id),
          email: u.email,
          name: u.name,
          image: u.image,
        } as any;
      } catch (e: any) {
        console.error("[auth credentials] DB error:", e?.message ?? e);
        return null;
      }
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers,
  callbacks: {
    // Google sign-in creates a user row (no password). Credentials provider
    // already returns a user that exists, so for credentials we just allow.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .limit(1);
          if (!existing || existing.length === 0) {
            await supabase.from("users").insert({
              name: user.name,
              email: user.email,
              image: user.image,
              google_id: user.id,
              role: "user", // Google users default to regular user
            });
          } else {
            await supabase
              .from("users")
              .update({ name: user.name, image: user.image, google_id: user.id })
              .eq("email", user.email);
          }
        } catch (e: any) {
          console.error("[auth signIn google]:", e?.message ?? e);
        }
      }
      return true;
    },

    // jwt — re-fetch role, name, and image from DB every cycle so updates propagate
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      if (token?.email) {
        try {
          const { data: rows } = await supabase
            .from("users")
            .select("id, role, name, image")
            .eq("email", token.email as string)
            .limit(1);
          if (rows && rows.length > 0) {
            token.dbId = rows[0].id;
            token.role = rows[0].role;
            token.name = rows[0].name;
            token.image = rows[0].image;
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
        if (token?.name) session.user.name = token.name;
        if (token?.image) session.user.image = token.image;
      }
      return session;
    },
  },
});
