import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user
          await User.create({
            name: user.name || "User",
            email: user.email || "",
            image: user.image || "",
            provider: account?.provider || "google",
            providerId: account?.providerAccountId || "",
          });
          console.log("✅ New user created:", user.email);
        } else {
          // Update last login
          existingUser.lastLogin = new Date();
          existingUser.image = user.image || existingUser.image || "";
          await existingUser.save();
        }

        return true;
      } catch (error) {
        console.error("❌ Sign in error:", error);
        return true; // Still allow sign in even if DB save fails
      }
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // We handle sign in on the main page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
