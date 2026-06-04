'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    email: string
    name: string
    phone?: string
    address?: string
    zipCode?: string
}

interface RegisterData {
    name: string
    email: string
    phone: string
    address: string
    zipCode: string
    password: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for existing session on mount
        const token = localStorage.getItem('auth_token')
        if (token) {
            // Decode JWT to get user info (in production, validate with backend)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUser(payload.user)
            } catch (error) {
                localStorage.removeItem('auth_token')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()


        if (!response.ok) {
            throw new Error((data as any).error || 'Login failed')
        }

        localStorage.setItem('auth_token', (data as any).token)
        setUser((data as any).user)
        router.push('/dashboard')
    }

    const register = async (registerData: RegisterData) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
        })

        const data = await response.json()


        if (!response.ok) {
            throw new Error((data as any).error || 'Registration failed')
        }

        localStorage.setItem('auth_token', (data as any).token)
        setUser((data as any).user)
        router.push('/dashboard')
    }

    const logout = () => {
        localStorage.removeItem('auth_token')
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
