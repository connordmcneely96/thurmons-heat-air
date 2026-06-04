import type { Metadata } from 'next'
import AdminLoginClient from './AdminLoginClient'

export const metadata: Metadata = {
    title: 'Admin Login',
    description: 'Secure admin login for Evergrow Landscaping.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function AdminLoginPage() {
    return <AdminLoginClient />
}
