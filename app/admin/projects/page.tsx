'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { fetchWithAuth } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge'

interface Project {
    id: number
    customerName: string | null
    customerEmail: string | null
    serviceName: string
    totalAmount: number
    depositAmount: number | null
    depositPaid: boolean
    balanceDue: number
    scheduledDate: string | null
    status: string
    statusDisplay: string
    createdAt: string
    description: string | null
}

const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
}

const CANCELLABLE = new Set(['scheduled', 'in_progress'])

type ProjectsResponse = {
    success: boolean
    projects?: unknown
    error?: string
}

function getProjectsFromResponse(data: ProjectsResponse): Project[] {
    if (!Array.isArray(data.projects)) return []
    return data.projects as Project[]
}

function parseProjectsResponse(payload: unknown): ProjectsResponse | null {
    if (!payload || typeof payload !== 'object') return null
    const maybe = payload as Record<string, unknown>
    if (typeof maybe.success !== 'boolean') return null

    return {
        success: maybe.success,
        projects: maybe.projects,
        error: typeof maybe.error === 'string' ? maybe.error : undefined,
    }
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth('/api/admin/projects?limit=50')
                if (res.ok) {
                    const payload = await res.json() as unknown
                    const data = parseProjectsResponse(payload)
                    if (data?.success) {
                        setProjects(getProjectsFromResponse(data))
                    } else {
                        setProjects([])
                    }
                }
            } catch (err) {
                console.error('Failed to load projects:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleCancel = async (project: Project) => {
        if (!confirm(`Cancel project #${project.id} for ${project.customerName || 'customer'}? This will also cancel any pending invoices.`)) return

        setCancellingId(project.id)
        setError(null)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${project.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled' }),
            })
            const data = await res.json() as ProjectsResponse
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel project')

            setProjects(prev =>
                prev.map(p => p.id === project.id
                    ? { ...p, status: 'cancelled', statusDisplay: 'Cancelled' }
                    : p
                )
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel project')
        } finally {
            setCancellingId(null)
        }
    }

    const scheduledProjects = projects
        .filter((p) => Boolean(p.scheduledDate))
        .sort((a, b) => {
            const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : Number.MAX_SAFE_INTEGER
            const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : Number.MAX_SAFE_INTEGER
            return aTime - bTime
        })

    const availabilityWindow = Array.from({ length: 14 }, (_, index) => {
        const day = new Date()
        day.setHours(0, 0, 0, 0)
        day.setDate(day.getDate() + index)

        const isoDate = day.toISOString().slice(0, 10)
        const jobs = scheduledProjects.filter((project) => {
            if (!project.scheduledDate) return false
            return project.scheduledDate.slice(0, 10) === isoDate
        })

        return {
            isoDate,
            label: day.toLocaleDateString(),
            jobs,
        }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Projects</h1>
                <p className="text-sm text-gray-500 mt-1">Track active and completed projects</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No projects yet. Projects are created from accepted quotes.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 bg-gray-800">
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Customer</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Service</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Amount</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Deposit</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Balance</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Scheduled</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {projects.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/projects/detail?id=${p.id}`} className="font-medium text-white hover:text-ocean-blue transition-colors">
                                                {p.customerName || '—'}
                                            </Link>
                                            <div className="font-medium text-white">{p.customerName || '—'}</div>
                                            <div className="text-xs text-gray-500">{p.customerEmail || 'No email on file'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{p.serviceName}</td>
                                        <td className="px-4 py-3 text-white font-medium">
                                            {formatCurrency(p.totalAmount)}
                                            <div className="text-xs text-gray-500">Created {formatDate(p.createdAt)}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <PaymentStatusBadge
                                                status={p.depositPaid ? 'paid' : 'pending'}
                                                amount={p.depositAmount ?? undefined}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{formatCurrency(p.balanceDue)}</td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {p.scheduledDate ? formatDate(p.scheduledDate) : <span className="text-gray-600 italic">Not set</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={STATUS_BADGE[p.status] || 'secondary'}>{p.statusDisplay}</Badge>
                                            {p.description && (
                                                <p className="text-xs text-gray-500 mt-2 max-w-xs line-clamp-2">{p.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/projects/detail?id=${p.id}`}
                                                    className="text-xs text-ocean-blue hover:underline whitespace-nowrap"
                                                >
                                                    View →
                                                </Link>
                                                {CANCELLABLE.has(p.status) && (
                                                    <button
                                                        onClick={() => handleCancel(p)}
                                                        disabled={cancellingId === p.id}
                                                        className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-600 rounded px-2 py-1 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                    >
                                                        {cancellingId === p.id ? 'Cancelling…' : 'Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 bg-gray-800">
                    <h2 className="text-sm font-semibold text-white">Schedule Calendar</h2>
                    <p className="text-xs text-gray-400 mt-1">Match project numbers and customer details to scheduled date/time, and spot open days quickly.</p>
                </div>

                <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/60">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Next 14 days availability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                        {availabilityWindow.map((day) => (
                            <div key={day.isoDate} className="rounded-md border border-gray-800 p-2 bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-300">{day.label}</span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${day.jobs.length === 0 ? 'bg-green-900/40 text-green-300' : 'bg-yellow-900/40 text-yellow-300'}`}>
                                        {day.jobs.length === 0 ? 'Available' : `${day.jobs.length} booked`}
                                    </span>
                                </div>
                                {day.jobs.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Jobs: {day.jobs.map((job) => `#${job.id}`).join(', ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {scheduledProjects.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">No scheduled projects yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 bg-gray-800/60">
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Project #</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Customer</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Service</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Scheduled Date/Time</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {scheduledProjects.map((p) => (
                                    <tr key={`schedule-${p.id}`} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3 text-white font-medium">#{p.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-white">{p.customerName || '—'}</div>
                                            <div className="text-xs text-gray-500">{p.customerEmail || 'No email on file'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{p.serviceName}</td>
                                        <td className="px-4 py-3 text-gray-300">{p.scheduledDate ? formatDate(p.scheduledDate) : 'Not set'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={STATUS_BADGE[p.status] || 'secondary'}>{p.statusDisplay}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
