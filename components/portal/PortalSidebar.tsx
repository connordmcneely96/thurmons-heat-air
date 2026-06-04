'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut, PieChart, ClipboardList, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthContext'

const navigation = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'Projects', href: '/portal/projects', icon: FolderKanban },
    { name: 'Quotes', href: '/portal/quotes', icon: ClipboardList },
    { name: 'Invoices', href: '/portal/invoices', icon: FileText },
    { name: 'Feedback', href: '/portal/feedback', icon: PieChart },
    { name: 'Settings', href: '/portal/settings', icon: Settings },
]

interface PortalSidebarProps {
    onClose?: () => void
}

export function PortalSidebar({ onClose }: PortalSidebarProps) {
    const pathname = usePathname()
    const { logout, user } = useAuth()

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                <span className="text-xl font-heading font-bold text-forest-green">Evergrow</span>
                {/* Close button — mobile only */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 rounded-md hover:bg-gray-100"
                        aria-label="Close navigation"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 space-y-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-ocean-blue/10 text-ocean-blue'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-ocean-blue' : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 h-5 w-5 flex-shrink-0'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center mb-4 px-3">
                    <div className="h-8 w-8 rounded-full bg-forest-green/20 flex items-center justify-center text-forest-green font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-500" />
                    Sign out
                </button>
            </div>
        </div>
    )
}
