import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import User from "../../models/users"
import { connectMongoDB } from "./mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectMongoDB();
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.status !== 'active') {
            throw new Error(
              user.status === 'pending' 
                ? 'Account pending admin approval' 
                : 'Account is suspended'
            );
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})