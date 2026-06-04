'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import Link from 'next/link'
import { DollarSign, Calendar, Clock, FileText } from 'lucide-react'

interface Project {
    id: number
    serviceName: string
    status: string
    statusDisplay: string
    description: string | null
    scheduledDate: string | null
}

interface InvoicesSummaryResponse {
    success?: boolean
    summary?: {
        totalPending: number
        totalPaid: number
    }
}

interface ProjectsResponse {
    success?: boolean
    projects?: Project[]
}

export default function PortalDashboard() {
    const { user, token } = useAuth()
    const [stats, setStats] = useState({ pending: 0, paid: 0 })
    const [recentProjects, setRecentProjects] = useState<Project[]>([])
    const [quotesCount, setQuotesCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!token) return

            try {
                // Fetch Invoices for Stats
                const invoicesRes = await fetch('/api/customer/invoices?limit=1', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const invoicesData = await invoicesRes.json() as InvoicesSummaryResponse

                // Fetch Recent Projects
                const projectsRes = await fetch('/api/customer/projects?limit=5', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const projectsData = await projectsRes.json() as ProjectsResponse

                if (invoicesData.success && invoicesData.summary) {
                    setStats({
                        pending: invoicesData.summary.totalPending,
                        paid: invoicesData.summary.totalPaid
                    })
                }

                if (projectsData.success && projectsData.projects) {
                    setRecentProjects(projectsData.projects)
                }

                const quotesRes = await fetch('/api/customer/quotes', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const quotesData = await quotesRes.json() as { success?: boolean; quotes?: unknown[] }
                if (quotesData.success && Array.isArray(quotesData.quotes)) {
                    setQuotesCount(quotesData.quotes.length)
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [token])

    if (loading) {
        return <div className="p-4">Loading dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name}
                </h1>
                <Link href="/quote-request">
                    <button className="mt-4 sm:mt-0 px-4 py-2 min-h-[44px] bg-forest-green text-white rounded-md hover:bg-forest-green-700 shadow-sm text-sm font-medium">
                        Request New Service
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Balance</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            ${stats.pending.toFixed(2)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/portal/invoices" className="font-medium text-ocean-blue hover:text-ocean-blue-600">
                                View bills &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {recentProjects.filter((p) => p.status === 'in_progress' || p.status === 'scheduled').length}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/portal/projects" className="font-medium text-ocean-blue hover:text-ocean-blue-600">
                                View projects &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Next Service</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {/* Placeholder logic for next scheduled date */}
                                            {recentProjects.find((p) => p.status === 'scheduled')?.scheduledDate
                                                ? new Date(recentProjects.find((p) => p.status === 'scheduled')?.scheduledDate || '').toLocaleDateString()
                                                : 'None Scheduled'
                                            }
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Quotes</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{quotesCount}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/portal/quotes" className="font-medium text-ocean-blue hover:text-ocean-blue-600">
                                View quotes &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Projects */}
            <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md overflow-x-auto">
                <ul role="list" className="divide-y divide-gray-200">
                    {recentProjects.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6 text-gray-500 italic text-center">No recent projects found.</li>
                    ) : (
                        recentProjects.map((project) => (
                            <li key={project.id}>
                                <Link href={`/portal/projects/detail?id=${project.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-ocean-blue truncate">{project.serviceName}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {project.statusDisplay}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {project.description || 'No description provided'}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Scheduled: <time dateTime={project.scheduledDate || undefined}>{project.scheduledDate ? new Date(project.scheduledDate).toLocaleDateString() : 'TBD'}</time>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                        <Link href="/portal/projects" className="font-medium text-ocean-blue hover:text-ocean-blue-600">
                            View all projects <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
