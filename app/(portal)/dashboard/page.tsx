'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { fetchWithAuth } from '@/lib/auth'

interface DashboardStats {
    activeProjects: number
    completedProjects: number
    pendingInvoices: number
    totalSpent: number
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats>({
        activeProjects: 0,
        completedProjects: 0,
        pendingInvoices: 0,
        totalSpent: 0,
    })
    const [recentProjects, setRecentProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            // Fetch projects
            const projectsRes = await fetchWithAuth('/api/customer/projects')
            const projectsData = await projectsRes.json() as any

            if (projectsData.success) {
                const projects = projectsData.data
                setRecentProjects(projects.slice(0, 3))

                // Calculate stats
                setStats({
                    activeProjects: projects.filter((p: any) => p.status === 'scheduled' || p.status === 'in_progress').length,
                    completedProjects: projects.filter((p: any) => p.status === 'completed').length,
                    pendingInvoices: 0, // Will be updated from invoices
                    totalSpent: projects.reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0),
                })
            }

            // Fetch invoices
            const invoicesRes = await fetchWithAuth('/api/customer/invoices')
            const invoicesData = await invoicesRes.json() as any

            if (invoicesData.success) {
                const pendingCount = invoicesData.data.filter((inv: any) => inv.status === 'pending').length
                setStats(prev => ({ ...prev, pendingInvoices: pendingCount }))
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-vibrant-gold border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
                    Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-600">
                    Here&apos;s an overview of your landscaping projects and account.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Active Projects</h3>
                        <span className="text-2xl">🚧</span>
                    </div>
                    <p className="text-3xl font-heading font-bold text-forest-green">
                        {stats.activeProjects}
                    </p>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
                        <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-3xl font-heading font-bold text-forest-green">
                        {stats.completedProjects}
                    </p>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Pending Invoices</h3>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-heading font-bold text-orange-600">
                        {stats.pendingInvoices}
                    </p>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Total Spent</h3>
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-3xl font-heading font-bold text-forest-green">
                        ${stats.totalSpent.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Recent Projects */}
            <div className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold text-forest-green">
                        Recent Projects
                    </h2>
                    <Link href="/dashboard/projects">
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>

                {recentProjects.length > 0 ? (
                    <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-vibrant-gold-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{project.service_type}</h3>
                                    <p className="text-sm text-gray-600">
                                        {project.scheduled_date ? `Scheduled: ${new Date(project.scheduled_date).toLocaleDateString()}` : 'Not scheduled yet'}
                                    </p>
                                </div>
                                <Badge variant={
                                    project.status === 'completed' ? 'success' :
                                        project.status === 'in_progress' ? 'warning' :
                                            'info'
                                }>
                                    {project.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No projects yet.</p>
                        <Link href="/quote-request">
                            <Button variant="primary" size="sm" className="mt-4">
                                Request Your First Quote
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-xl font-heading font-bold text-forest-green mb-6">
                    Quick Actions
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/quote-request" className="block">
                        <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-vibrant-gold transition-colors">
                            <div className="text-3xl mb-2">📋</div>
                            <h3 className="font-semibold text-gray-900 mb-1">Request Quote</h3>
                            <p className="text-sm text-gray-600">Get pricing for a new project</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/invoices" className="block">
                        <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-vibrant-gold transition-colors">
                            <div className="text-3xl mb-2">💳</div>
                            <h3 className="font-semibold text-gray-900 mb-1">Pay Invoice</h3>
                            <p className="text-sm text-gray-600">View and pay pending invoices</p>
                        </div>
                    </Link>

                    <Link href="/contact" className="block">
                        <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-vibrant-gold transition-colors">
                            <div className="text-3xl mb-2">📞</div>
                            <h3 className="font-semibold text-gray-900 mb-1">Contact Us</h3>
                            <p className="text-sm text-gray-600">Questions? We&apos;re here to help</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
