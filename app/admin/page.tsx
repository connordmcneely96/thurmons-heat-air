'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatsCard } from '@/components/admin/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { fetchWithAuth } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'

interface QuoteSummary {
    pending: number
    quoted: number
    accepted: number
    declined: number
}

interface Quote {
    id: number
    customerName: string
    serviceName: string
    status: string
    statusDisplay: string
    createdAt: string
    daysWaiting: number
    needsResponse: boolean
}

interface Project {
    id: number
    customerName: string
    serviceName: string
    status: string
    statusDisplay: string
    totalAmount: number
    scheduledDate: string | null
}

export default function AdminDashboard() {
    const [summary, setSummary] = useState<QuoteSummary>({ pending: 0, quoted: 0, accepted: 0, declined: 0 })
    const [recentQuotes, setRecentQuotes] = useState<Quote[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [quotesRes, projectsRes] = await Promise.all([
                    fetchWithAuth('/api/admin/quotes?limit=5'),
                    fetchWithAuth('/api/admin/projects?limit=5'),
                ])

                if (quotesRes.ok) {
                    const data = await quotesRes.json() as any
                    if (data.success) {
                        setSummary(data.summary)
                        setRecentQuotes(data.quotes)
                    }
                }

                if (projectsRes.ok) {
                    const data = await projectsRes.json() as any
                    if (data.success) {
                        setProjects(data.projects)
                    }
                }
            } catch (err) {
                console.error('Dashboard load error:', err)
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const totalQuotes = summary.pending + summary.quoted + summary.accepted + summary.declined

    const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
        pending: 'warning',
        quoted: 'info',
        accepted: 'success',
        declined: 'destructive',
        scheduled: 'info',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'destructive',
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-800 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-900 rounded-xl border border-gray-700 animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-gray-900 rounded-xl border border-gray-700 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400 mt-1">Overview of your business activity</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    label="Pending Quotes"
                    value={summary.pending}
                    variant={summary.pending > 0 ? 'warning' : 'default'}
                    icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    onClick={() => window.location.href = '/admin/quotes?status=pending'}
                />
                <StatsCard
                    label="Total Quotes"
                    value={totalQuotes}
                    variant="default"
                    icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
                <StatsCard
                    label="Active Projects"
                    value={projects.filter(p => p.status === 'scheduled' || p.status === 'in_progress').length}
                    variant="info"
                    icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
                <StatsCard
                    label="Accepted"
                    value={summary.accepted}
                    variant="success"
                    icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </div>

            {/* Urgent Attention Banner */}
            {summary.pending > 0 && (
                <Link href="/admin/quotes?status=pending" className="block bg-yellow-500/10 border border-yellow-600/30 rounded-xl p-4 hover:bg-yellow-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-yellow-300">{summary.pending} quote{summary.pending !== 1 ? 's' : ''} awaiting your response</p>
                            <p className="text-sm text-yellow-400/70">Click to view and respond to pending quotes</p>
                        </div>
                    </div>
                </Link>
            )}

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Quotes */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Quotes</h2>
                        <Link href="/admin/quotes" className="text-sm text-forest-green hover:underline">View all</Link>
                    </div>
                    {recentQuotes.length === 0 ? (
                        <p className="p-5 text-sm text-gray-500 text-center">No quotes yet</p>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {recentQuotes.map((quote) => (
                                <Link key={quote.id} href={`/admin/quotes/detail?id=${quote.id}`} className="block px-5 py-3 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{quote.customerName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{quote.serviceName}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            {quote.needsResponse && (
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            )}
                                            <Badge variant={STATUS_BADGE[quote.status] || 'secondary'}>{quote.statusDisplay}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Projects */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Active Projects</h2>
                        <Link href="/admin/projects" className="text-sm text-forest-green hover:underline">View all</Link>
                    </div>
                    {projects.length === 0 ? (
                        <p className="p-5 text-sm text-gray-500 text-center">No projects yet</p>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {projects.map((project) => (
                                <div key={project.id} className="px-5 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{project.customerName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">
                                                {project.serviceName}
                                                {project.scheduledDate && ` — ${formatDate(project.scheduledDate)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            <span className="text-sm font-medium text-white">{formatCurrency(project.totalAmount)}</span>
                                            <Badge variant={STATUS_BADGE[project.status] || 'secondary'}>{project.statusDisplay}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
