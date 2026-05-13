import { create } from "zustand"
import { supabase, type Profile } from "../lib/supabase"

type AuthResult = { error: { message?: string } | null; data: any }

function withTimeout<T>(
  promise: any,
  timeoutMs = 10000,
  errorMessage = "A operação demorou demais",
) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    }),
  ])
}

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: SignUpData) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  init: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  full_name: string
  phone: string
  role?: "admin" | "ceo"
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }
    set({ initialized: true })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null })
      }
    })
  },

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (data) set({ user: data })
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const normalizedEmail = email.trim().toLowerCase()

      const { data, error } = await withTimeout<AuthResult>(
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        }) as any,
        20000,
        "Erro ao entrar: a requisição demorou demais",
      )

      if (error) {
        set({ loading: false })
        const rawMessage = error.message ?? "Erro ao entrar"

        if (rawMessage.toLowerCase().includes("invalid login credentials")) {
          return { error: "Credenciais inválidas. Verifique e-mail e senha." }
        }

        if (rawMessage.toLowerCase().includes("email not confirmed")) {
          return {
            error: "E-mail não confirmado. Verifique sua caixa de entrada.",
          }
        }

        return { error: rawMessage }
      }

      // Load profile immediately when possible; onAuthStateChange remains as fallback.
      const authUserId = data?.user?.id
      if (authUserId) {
        await get().fetchProfile(authUserId)
      }

      set({ loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: err instanceof Error ? err.message : "Erro ao entrar" }
    }
  },

  signUp: async ({ email, password, full_name, phone, role = "admin" }) => {
    set({ loading: true })
    try {
      const { data, error: authError } = await withTimeout<any>(
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name, phone, role } },
        }),
        30000,
        "O cadastro demorou demais. Verifique sua conexão."
      )

      if (authError) {
        return { data: null, error: authError.message ?? "Erro ao cadastrar" }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Erro inesperado ao cadastrar" }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Error signing out:", err)
    } finally {
      set({ user: null })
      // Clear any local storage that might be stuck
      localStorage.clear()
      sessionStorage.clear()
    }
  },
}))
