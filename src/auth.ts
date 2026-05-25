import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // ① signIn — runs once per OAuth login.
    // Create/update the DB row but ALWAYS return true so the user is signed in
    // even if the DB is unreachable.
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user?.email) return true;
      try {
        const { data: rows } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .limit(1);

        if (!rows || rows.length === 0) {
          const { error } = await supabase.from("users").insert({
            name: user.name,
            email: user.email,
            image: user.image,
            google_id: user.id,
          });
          if (error) console.error("[auth signIn] insert error:", error.message);
        } else {
          const { error } = await supabase
            .from("users")
            .update({ name: user.name, image: user.image, google_id: user.id })
            .eq("email", user.email);
          if (error) console.error("[auth signIn] update error:", error.message);
        }
      } catch (e: any) {
        console.error("[auth signIn] unexpected:", e?.message ?? e);
      }
      return true;
    },

    // ② jwt — runs on EVERY request that touches auth.
    // Look up the DB row only on first login (when `user` is present)
    // and cache id/role on the token so subsequent requests are fast.
    async jwt({ token, user, trigger }) {
      // First login OR session.update() called → refresh from DB
      const shouldRefresh = !!user || trigger === "update";

      if (shouldRefresh && token?.email) {
        try {
          const { data: rows } = await supabase
            .from("users")
            .select("id, role")
            .eq("email", token.email as string)
            .limit(1);
          if (rows && rows.length > 0) {
            token.dbId = rows[0].id;
            token.role = rows[0].role;
          } else {
            token.dbId = null;
            token.role = "user";
          }
        } catch (e: any) {
          console.error("[auth jwt] DB lookup failed:", e?.message ?? e);
        }
      }
      return token;
    },

    // ③ session — runs on every auth() / useSession() call.
    // Copy cached values from the JWT — NO DB queries here, so the session
    // is always returned reliably (no timeout = no surprise logout).
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token?.dbId ?? null;
        session.user.role = token?.role ?? "user";
      }
      return session;
    },
  },
});
