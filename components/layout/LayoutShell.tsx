'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MainLayout from '@/components/layout/MainLayout'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/admin')

    if (isAdmin) {
        // Admin pages have their own layout with sidebar — skip site header/footer
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <MainLayout>
                {children}
            </MainLayout>
            <Footer />
        </>
    )
}
