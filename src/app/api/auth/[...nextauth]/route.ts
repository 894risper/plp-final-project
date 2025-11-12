import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectMongoDB} from "../../../../../lib/mongodb"
import User from "../../../../../models/users";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // This runs when user tries to login
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectMongoDB();
                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    return null;
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password, 
                    user.password
                );

                if (!isPasswordCorrect) {
                    return null;
                }

                // Return user data (this gets stored in session)
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            }
        })
    ],
    session: {
        strategy: "jwt" // Use JWT tokens for sessions
    },
    pages: {
        signIn: "/login" // Your custom login page
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };