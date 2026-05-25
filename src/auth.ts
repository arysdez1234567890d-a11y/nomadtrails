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
    // Creates the DB row. First-ever user is auto-promoted to admin.
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user?.email) return true;
      try {
        const { data: rows } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .limit(1);

        if (!rows || rows.length === 0) {
          // First user gets admin role automatically — solves the bootstrap problem
          const { count } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });
          const isFirstUser = (count ?? 0) === 0;

          const { error } = await supabase.from("users").insert({
            name: user.name,
            email: user.email,
            image: user.image,
            google_id: user.id,
            role: isFirstUser ? "admin" : "user",
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

    // ② jwt — runs on EVERY auth call. We refresh from DB on first login,
    // on session.update(), AND every time the JWT cycles so role changes
    // applied via the admin panel propagate without needing the user to
    // re-login.
    async jwt({ token, user, trigger }) {
      // Always re-read DB role if we have an email — keeps role in sync
      // when an admin promotes another user via the panel
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
          } else if (user) {
            // First login but DB insert may not have completed yet
            token.dbId = null;
            token.role = "user";
          }
        } catch (e: any) {
          console.error("[auth jwt] DB lookup failed:", e?.message ?? e);
        }
      }
      return token;
    },

    // ③ session — copies cached values from the JWT.
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token?.dbId ?? null;
        session.user.role = token?.role ?? "user";
      }
      return session;
    },
  },
});
