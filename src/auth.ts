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
      if (account?.provider === "google") {
        try {
          const { data: rows } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .limit(1);

          if (!rows || rows.length === 0) {
            await supabase.from('users').insert({
              name: user.name,
              email: user.email,
              image: user.image,
              google_id: user.id,
            });
          } else {
            await supabase.from('users')
              .update({ name: user.name, image: user.image, google_id: user.id })
              .eq('email', user.email);
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB:", error);
          return true;
        }
      }
      return true;
    },
    async session({ session }: any) {
      if (session.user) {
        try {
          const { data: rows } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', session.user.email)
            .limit(1);
          if (rows && rows.length > 0) {
            session.user.id = rows[0].id;
            session.user.role = rows[0].role;
          }
        } catch (error) {
          console.error("Error fetching user data from DB:", error);
        }
      }
      return session;
    },
  },
});
