"use client"
import { useSession } from "next-auth/react"

export const useUserRole = () => {
  const { data: session } = useSession()
  return (session?.user as any)?.role || 'public'  // Add 'as any' here
}

export const hasAccess = (userRole: string, requiredRole: string) => {
  const roleHierarchy = {
    'public': 1,
    'journalist': 2,
    'admin': 3
  }
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

export const useHasAccess = (requiredRole: string) => {
  const userRole = useUserRole()
  return hasAccess(userRole, requiredRole)
}