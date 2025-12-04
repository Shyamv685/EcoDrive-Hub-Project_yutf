"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  ecoScore: number
  greenTier: string
  credits: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      
      const { data: result, error } = await supabase.rpc("authenticate_user", {
        email_param: email,
        password_param: password
      })
      
      if (error || !result || result.length === 0) {
        return false
      }
      
      const userData = result[0]
      const userObj: User = {
        id: userData.user_id,
        name: userData.user_name,
        email: userData.user_email,
        ecoScore: userData.eco_score,
        greenTier: userData.green_tier,
        credits: userData.credits
      }
      
      setUser(userObj)
      localStorage.setItem("user", JSON.stringify(userObj))
      return true
    } catch {
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      
      const { data: result, error } = await supabase.rpc("create_user_with_auth", {
        user_email: email,
        user_password: password,
        user_name: name
      })
      
      if (error) {
        return false
      }
      
      // Auto-login after registration
      return await login(email, password)
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
