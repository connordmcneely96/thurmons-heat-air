'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface Application {
    id: number
    name: string
    email: string
    phone: string
    cityState: string
    position: string
    willingToTravel: boolean
    hasLicense: boolean
    yearsExperience: number | null
    equipmentSkills: string[]
    resumeUrl: string | null
    coverLetter: string | null
    availabilityDate: string | null
    status: string
    submittedAt: string
    updatedAt: string | null
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
    reviewing: 'bg-blue-900/40 text-blue-400 border-blue-700',
    interviewed: 'bg-purple-900/40 text-purple-400 border-purple-700',
    accepted: 'bg-green-900/40 text-green-400 border-green-700',
    rejected: 'bg-red-900/40 text-red-400 border-red-700',
    withdrawn: 'bg-gray-800 text-gray-400 border-gray-700',
}

const VALID_STATUSES = ['pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn']

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth('/api/admin/applications')
                const data = await res.json() as { success: boolean; applications?: Application[]; error?: string }
                if (data.success && data.applications) {
                    setApplications(data.applications)
                } else {
                    setError(data.error || 'Failed to load applications')
                }
            } catch (err) {
                console.error('Failed to load applications:', err)
                setError('Failed to load applications')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    async function updateStatus(appId: number, status: string) {
        setUpdatingId(appId)
        try {
            const res = await fetchWithAuth(`/api/admin/applications/${appId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            })
            const data = await res.json() as { success: boolean; error?: string }
            if (data.success) {
                setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
            } else {
                alert(data.error || 'Failed to update status')
            }
        } catch (err) {
            console.error('Status update error:', err)
            alert('Failed to update status')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Job Applications</h1>
                <p className="text-sm text-gray-500 mt-1">Review applications from potential team members</p>
            </div>

            {loading ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <p className="text-gray-400">Loading applications...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400">{error}</div>
            ) : applications.length === 0 ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <p className="text-gray-400">No applications yet.</p>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Position</th>
                                <th className="px-4 py-3 text-left">City/State</th>
                                <th className="px-4 py-3 text-center">License</th>
                                <th className="px-4 py-3 text-center">Travel</th>
                                <th className="px-4 py-3 text-left">Applied</th>
                                <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {applications.flatMap(app => {
                                const rows = [(
                                    <tr
                                        key={app.id}
                                        className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white">{app.name}</div>
                                            <div className="text-xs text-gray-500">{app.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-xs max-w-[160px] truncate">{app.position}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{app.cityState}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-bold ${app.hasLicense ? 'text-green-400' : 'text-gray-500'}`}>
                                                {app.hasLicense ? 'Y' : 'N'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-bold ${app.willingToTravel ? 'text-green-400' : 'text-gray-500'}`}>
                                                {app.willingToTravel ? 'Y' : 'N'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {formatDate(app.submittedAt)}
                                        </td>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={app.status}
                                                disabled={updatingId === app.id}
                                                onChange={e => updateStatus(app.id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-full border bg-transparent cursor-pointer disabled:opacity-50 ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}
                                            >
                                                {VALID_STATUSES.map(s => (
                                                    <option key={s} value={s} className="bg-gray-900 text-white">
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                )]

                                if (expandedId === app.id) {
                                    rows.push((
                                        <tr key={`${app.id}-detail`}>
                                            <td colSpan={7} className="px-4 py-4 bg-gray-800/60 border-t border-gray-700">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1">Phone</p>
                                                        <p className="text-gray-300">{app.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1">Years Experience</p>
                                                        <p className="text-gray-300">{app.yearsExperience ?? '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1">Availability</p>
                                                        <p className="text-gray-300">{app.availabilityDate ? formatDate(app.availabilityDate) : '—'}</p>
                                                    </div>
                                                    {app.equipmentSkills.length > 0 && (
                                                        <div className="col-span-2 md:col-span-3">
                                                            <p className="text-gray-500 text-xs mb-1">Equipment Skills</p>
                                                            <p className="text-gray-300">{app.equipmentSkills.join(', ')}</p>
                                                        </div>
                                                    )}
                                                    {app.resumeUrl && (
                                                        <div>
                                                            <p className="text-gray-500 text-xs mb-1">Resume</p>
                                                            <a
                                                                href={app.resumeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                View Resume →
                                                            </a>
                                                        </div>
                                                    )}
                                                    {app.coverLetter && (
                                                        <div className="col-span-2 md:col-span-3">
                                                            <p className="text-gray-500 text-xs mb-1">Cover Letter</p>
                                                            <p className="text-gray-300 text-xs whitespace-pre-wrap">{app.coverLetter}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }

                                return rows
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
