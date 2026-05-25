import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user?.email) return true;

      try {
        const { data: rows, error: selectErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .limit(1);

        if (selectErr) {
          console.error("[auth signIn] select error:", selectErr.message);
          return true;
        }

        if (!rows || rows.length === 0) {
          const { error: insertErr } = await supabase.from("users").insert({
            name: user.name,
            email: user.email,
            image: user.image,
            google_id: user.id,
          });
          if (insertErr) console.error("[auth signIn] insert error:", insertErr.message);
        } else {
          const { error: updateErr } = await supabase
            .from("users")
            .update({ name: user.name, image: user.image, google_id: user.id })
            .eq("email", user.email);
          if (updateErr) console.error("[auth signIn] update error:", updateErr.message);
        }
      } catch (e: any) {
        console.error("[auth signIn] unexpected:", e?.message ?? e);
      }
      return true;
    },
    async session({ session }: any) {
      if (!session?.user?.email) return session;
      try {
        const { data: rows, error } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", session.user.email)
          .limit(1);
        if (error) {
          console.error("[auth session] select error:", error.message);
        } else if (rows && rows.length > 0) {
          session.user.id = rows[0].id;
          session.user.role = rows[0].role;
        }
      } catch (e: any) {
        console.error("[auth session] unexpected:", e?.message ?? e);
      }
      return session;
    },
  },
});
