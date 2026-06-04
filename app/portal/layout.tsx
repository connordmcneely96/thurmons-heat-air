import { AuthProvider } from '@/components/portal/AuthContext'

export default function PortalRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900">
                {children}
            </div>
        </AuthProvider>
    )
}
