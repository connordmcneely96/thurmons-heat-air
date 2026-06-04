'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/portal/AuthContext'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { Menu } from 'lucide-react'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/portal/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-blue border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your portal...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — fixed on mobile, static on desktop */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transition-transform duration-300
                md:static md:translate-x-0 md:flex md:flex-shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <PortalSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Mobile top bar with hamburger */}
                <div className="flex items-center h-14 px-4 bg-white border-b border-gray-200 md:hidden flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 rounded-md hover:bg-gray-100"
                        aria-label="Open navigation"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-3 font-heading font-bold text-forest-green text-lg">Evergrow Portal</span>
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
