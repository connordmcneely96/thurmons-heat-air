'use client'


import { PortalNav } from '@/components/portal/PortalNav'
import { ProtectedRoute } from '@/components/portal/ProtectedRoute'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <ProtectedRoute>
                <PortalNav />
                <main className="container py-8">
                    {children}
                </main>
            </ProtectedRoute>
        </div>
    )
}
