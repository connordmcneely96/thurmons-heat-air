'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📋' },
    { href: '/dashboard/invoices', label: 'Invoices', icon: '💰' },
    { href: '/dashboard/feedback', label: 'Feedback', icon: '⭐' },
]

export function PortalNav() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🌳</span>
                        <span className="font-heading font-bold text-forest-green">
                            Evergrow
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === item.href
                                        ? 'bg-forest-green text-white'
                                        : 'text-gray-600 hover:text-forest-green'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4">
                    <div className="flex gap-2 overflow-x-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${pathname === item.href
                                        ? 'bg-forest-green text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}
