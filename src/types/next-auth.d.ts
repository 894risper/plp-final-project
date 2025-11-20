import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    id?: string
    status?: string
    firstName?: string
    lastName?: string
  }

  interface Session {
    user: {
      id?: string
      email?: string
      name?: string
      role?: string
      status?: string
      firstName?: string
      lastName?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    status?: string
    firstName?: string
    lastName?: string
  }
}