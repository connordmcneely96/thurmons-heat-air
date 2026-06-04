'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    login: (token: string, user: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for stored session
        const storedToken = localStorage.getItem('portal_token')
        const storedUser = localStorage.getItem('portal_user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('portal_token', newToken)
        localStorage.setItem('portal_user', JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
        router.push('/portal')
    }

    const logout = () => {
        localStorage.removeItem('portal_token')
        localStorage.removeItem('portal_user')
        setToken(null)
        setUser(null)
        router.push('/portal/login')
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
