'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getAuthToken, removeAuthToken } from '@/lib/auth'

interface JwtPayload {
    user: {
        id: number
        email: string
        name: string
    }
    role?: string
}

function decodeToken(token: string): JwtPayload | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload
    } catch {
        return null
    }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    // null = still checking, true = authorized, false = not authorized
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    const [userName, setUserName] = useState<string | undefined>()

    const isLoginPage = pathname?.startsWith('/admin/login')

    useEffect(() => {
        // On login page, redirect to dashboard if already authenticated as admin
        if (isLoginPage) {
            const token = getAuthToken()
            if (token) {
                const decoded = decodeToken(token)
                if (decoded?.role === 'admin') {
                    router.replace('/admin')
                }
            }
            setAuthorized(false)
            return
        }

        const token = getAuthToken()
        if (!token) {
            router.replace('/admin/login')
            return
        }

        const decoded = decodeToken(token)
        if (!decoded) {
            removeAuthToken()
            router.replace('/admin/login')
            return
        }

        if (decoded.role !== 'admin') {
            router.replace('/dashboard')
            return
        }

        setUserName(decoded.user?.name || decoded.user?.email)
        setAuthorized(true)
    }, [router, isLoginPage])

    const handleLogout = () => {
        removeAuthToken()
        router.replace('/admin/login')
    }

    // Login page renders without the sidebar/auth gate
    if (isLoginPage) {
        return <>{children}</>
    }

    // null = still checking, false = redirecting — never flash dashboard content
    if (authorized !== true) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-charcoal">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-deep-charcoal">
            <AdminSidebar userName={userName} onLogout={handleLogout} />
            <main className="lg:ml-60 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
