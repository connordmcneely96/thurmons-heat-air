'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { fetchWithAuth } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge'

interface Invoice {
    id: number
    amount: number
    invoiceType: string
    invoiceTypeDisplay: string
    status: string
    paidAt: string | null
    dueDate: string | null
    createdAt: string
}

interface Project {
    id: number
    customerId: number | null
    quoteId: number | null
    serviceType: string | null
    serviceName: string
    totalAmount: number
    depositAmount: number
    depositPaid: boolean
    balancePaid: boolean
    balanceDue: number
    scheduledDate: string | null
    scheduledTime: string | null
    status: string
    statusDisplay: string
    completedAt: string | null
    createdAt: string
    description: string | null
    customer: {
        name: string | null
        email: string | null
        phone: string | null
        address: string | null
    }
    invoices: Invoice[]
}

const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
}

const INVOICE_STATUS_BADGE: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'destructive',
}

const CANCELLABLE = new Set(['scheduled', 'in_progress'])

function AdminProjectDetailContent() {
    const searchParams = useSearchParams()
    const { addToast } = useToast()
    const projectId = searchParams.get('id')

    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)

    // Schedule update
    const [schedDate, setSchedDate] = useState('')
    const [schedTime, setSchedTime] = useState('')
    const [schedSubmitting, setSchedSubmitting] = useState(false)
    const [schedSuccess, setSchedSuccess] = useState(false)
    const [schedError, setSchedError] = useState<string | null>(null)

    // Cancel project
    const [cancelling, setCancelling] = useState(false)

    // Mark as completed
    const [completing, setCompleting] = useState(false)

    useEffect(() => {
        if (!projectId) { setLoading(false); return }

        fetchWithAuth(`/api/admin/projects/${projectId}`)
            .then(res => res.ok ? res.json() : null)
            .then((data: any) => {
                if (data?.success && data.project) {
                    setProject(data.project)
                    setSchedDate(data.project.scheduledDate || '')
                    setSchedTime(data.project.scheduledTime || '')
                }
            })
            .catch(err => console.error('Failed to load project:', err))
            .finally(() => setLoading(false))
    }, [projectId])

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!project || !schedDate) return
        setSchedSubmitting(true)
        setSchedError(null)
        setSchedSuccess(false)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${project.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ scheduledDate: schedDate, scheduledTime: schedTime || undefined }),
            })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update schedule')
            setProject(p => p ? { ...p, scheduledDate: schedDate, scheduledTime: schedTime || null } : p)
            setSchedSuccess(true)
            addToast({ type: 'success', message: 'Schedule updated!' })
        } catch (err) {
            setSchedError(err instanceof Error ? err.message : 'Failed to update')
        } finally {
            setSchedSubmitting(false)
        }
    }

    const handleCancel = async () => {
        if (!project) return
        if (!confirm(`Cancel project #${project.id}? This will also cancel any pending invoices.`)) return
        setCancelling(true)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${project.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled' }),
            })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel project')
            setProject(p => p ? { ...p, status: 'cancelled', statusDisplay: 'Cancelled' } : p)
            addToast({ type: 'success', message: 'Project cancelled' })
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to cancel' })
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-6 bg-gray-800 rounded w-40 animate-pulse" />
                <div className="h-64 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
            </div>
        )
    }

    if (!projectId || !project) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Project not found</p>
                <Link href="/admin/projects"><Button variant="outline">Back to Projects</Button></Link>
            </div>
        )
    }

    const handleMarkComplete = async () => {
        if (!project) return
        if (!confirm(
            'Mark this project as complete? This will generate the final invoice and notify the customer.'
        )) return
        setCompleting(true)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${project.id}/complete`, { method: 'POST' })
            const data = await res.json() as { success: boolean; error?: string; balanceAmount?: number }
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to complete project')
            setProject(p => p ? { ...p, status: 'completed', statusDisplay: 'Completed', balancePaid: false } : p)
            addToast({ type: 'success', message: 'Project marked as complete! Balance invoice created.' })
            // Reload to get updated invoices
            fetchWithAuth(`/api/admin/projects/${project.id}`)
                .then(r => r.json())
                .then((d: any) => { if (d?.success && d.project) setProject(d.project) })
                .catch(() => {})
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to complete project' })
        } finally {
            setCompleting(false)
        }
    }

    const isCancellable = CANCELLABLE.has(project.status)
    const isCompletable = (project.status === 'scheduled' || project.status === 'in_progress') && project.depositPaid
    const totalPaid =
        (project.depositPaid ? project.depositAmount : 0) +
        (project.balancePaid ? project.balanceDue : 0)
    const outstandingBalance = project.totalAmount - totalPaid

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/admin" className="hover:text-white">Dashboard</Link>
                <span>/</span>
                <Link href="/admin/projects" className="hover:text-white">Projects</Link>
                <span>/</span>
                <span className="text-white">#{project.id}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-white">{project.serviceName}</h1>
                        <Badge variant={STATUS_BADGE[project.status] || 'secondary'}>
                            {project.statusDisplay}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Project #{project.id} · Created {formatDate(project.createdAt)}
                        {project.quoteId && (
                            <> ·{' '}
                                <Link href={`/admin/quotes/detail?id=${project.quoteId}`} className="text-ocean-blue hover:underline">
                                    Quote #{project.quoteId}
                                </Link>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isCompletable && (
                        <button
                            onClick={handleMarkComplete}
                            disabled={completing}
                            className="text-sm text-white bg-green-700 hover:bg-green-600 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap font-medium"
                        >
                            {completing ? 'Processing…' : '✅ Mark as Completed'}
                        </button>
                    )}
                    {isCancellable && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-600 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {cancelling ? 'Cancelling…' : 'Cancel Project'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Left: Schedule + Financials + Invoices ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Schedule card */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Schedule</h2>
                        </div>
                        <div className="p-5">
                            {project.scheduledDate ? (
                                <p className="text-sm text-white mb-4">
                                    Currently scheduled for{' '}
                                    <span className="font-semibold">
                                        {new Date(project.scheduledDate).toLocaleDateString('en-US', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                    {project.scheduledTime && ` at ${project.scheduledTime}`}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4 italic">No date scheduled yet</p>
                            )}

                            {isCancellable && (
                                <form onSubmit={handleUpdateSchedule} className="space-y-3">
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">
                                                Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={schedDate}
                                                onChange={e => { setSchedDate(e.target.value); setSchedSuccess(false) }}
                                                className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Time (optional)</label>
                                            <input
                                                type="time"
                                                value={schedTime}
                                                onChange={e => setSchedTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                            />
                                        </div>
                                    </div>
                                    {schedError && <p className="text-xs text-red-400">{schedError}</p>}
                                    {schedSuccess && <p className="text-xs text-green-400">Schedule updated!</p>}
                                    <Button type="submit" variant="secondary" size="sm" isLoading={schedSubmitting}>
                                        {project.scheduledDate ? 'Update Schedule' : 'Set Schedule'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* Financial summary */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Financials</h2>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Total</p>
                                    <p className="text-lg font-bold text-white">{formatCurrency(project.totalAmount)}</p>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Deposit</p>
                                    <p className={`text-lg font-bold ${project.depositPaid ? 'text-green-400' : 'text-white'}`}>
                                        {formatCurrency(project.depositAmount)}
                                    </p>
                                    <p className="text-xs mt-0.5">
                                        {project.depositPaid
                                            ? <span className="text-green-400">✓ Paid</span>
                                            : <span className="text-yellow-400">Pending</span>}
                                    </p>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                                    <p className={`text-lg font-bold ${project.balancePaid ? 'text-green-400' : 'text-white'}`}>
                                        {formatCurrency(project.totalAmount - project.depositAmount)}
                                    </p>
                                    <p className="text-xs mt-0.5">
                                        {project.balancePaid
                                            ? <span className="text-green-400">✓ Paid</span>
                                            : <span className="text-yellow-400">Pending</span>}
                                    </p>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                                    <p className={`text-lg font-bold ${outstandingBalance <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {outstandingBalance <= 0 ? 'Paid in Full' : formatCurrency(outstandingBalance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment Overview */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Payment Overview</h2>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {/* Deposit row */}
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Deposit (50%)</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(project.depositAmount)}</p>
                                </div>
                                <PaymentStatusBadge
                                    status={project.depositPaid ? 'paid' : 'pending'}
                                    paidAt={project.invoices.find(i => i.invoiceType === 'deposit' && i.status === 'paid')?.paidAt}
                                    amount={project.depositAmount}
                                />
                            </div>
                            {/* Balance row */}
                            {(() => {
                                const balanceInv = project.invoices.find(i => i.invoiceType === 'balance')
                                const balanceAmt = project.totalAmount - project.depositAmount
                                if (!balanceInv) {
                                    return (
                                        <div className="px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-300">Final Balance</p>
                                                <p className="text-xs text-gray-500 italic">Will generate when project is marked complete</p>
                                            </div>
                                            <span className="text-gray-400 text-sm">—</span>
                                        </div>
                                    )
                                }
                                if (balanceInv.status === 'paid') {
                                    return (
                                        <div className="px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-300">Final Balance</p>
                                                <p className="text-xs text-gray-500">{formatCurrency(balanceAmt)}</p>
                                            </div>
                                            <PaymentStatusBadge status="paid" paidAt={balanceInv.paidAt} amount={balanceAmt} />
                                        </div>
                                    )
                                }
                                return (
                                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-300">Final Balance</p>
                                            <p className="text-xs text-gray-500">
                                                {formatCurrency(balanceAmt)}
                                                {balanceInv.dueDate ? ` · Due ${formatDate(balanceInv.dueDate)}` : ''}
                                            </p>
                                        </div>
                                        <PaymentStatusBadge status="pending" amount={balanceAmt} />
                                    </div>
                                )
                            })()}
                        </div>
                    </section>

                    {/* Invoices */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">
                                Invoices ({project.invoices.length})
                            </h2>
                        </div>
                        {project.invoices.length === 0 ? (
                            <p className="p-5 text-sm text-gray-500 italic">No invoices yet</p>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {project.invoices.map(inv => (
                                    <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-white">
                                                Invoice #{inv.id} — {inv.invoiceTypeDisplay}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Created {inv.createdAt ? formatDate(inv.createdAt) : '—'}
                                                {inv.dueDate && ` · Due ${formatDate(inv.dueDate)}`}
                                                {inv.paidAt && ` · Paid ${formatDate(inv.paidAt)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-sm font-semibold text-white">
                                                {formatCurrency(inv.amount)}
                                            </span>
                                            <Badge variant={INVOICE_STATUS_BADGE[inv.status] || 'secondary'} className="text-xs">
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Description */}
                    {project.description && (
                        <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                                <h2 className="font-semibold text-white text-sm">Service Description</h2>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.description}</p>
                            </div>
                        </section>
                    )}
                </div>

                {/* ── Right: Customer info ── */}
                <div className="space-y-6">
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Customer</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                                <p className="text-sm font-medium text-white">{project.customer.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                {project.customer.email ? (
                                    <a href={`mailto:${project.customer.email}`} className="text-sm text-ocean-blue hover:underline break-all">
                                        {project.customer.email}
                                    </a>
                                ) : <p className="text-sm text-gray-400">—</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                                {project.customer.phone ? (
                                    <a href={`tel:${project.customer.phone}`} className="text-sm text-ocean-blue hover:underline">
                                        {project.customer.phone}
                                    </a>
                                ) : <p className="text-sm text-gray-400">—</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                                <p className="text-sm text-white">{project.customer.address || '—'}</p>
                            </div>
                            {project.customer.email && (
                                <a
                                    href={`mailto:${project.customer.email}`}
                                    className="block text-center text-xs bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2 px-3 transition-colors mt-2"
                                >
                                    Send Email
                                </a>
                            )}
                        </div>
                    </section>

                    {/* Project metadata */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Details</h2>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Service</span>
                                <span className="text-white text-right">{project.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <Badge variant={STATUS_BADGE[project.status] || 'secondary'} className="text-xs">
                                    {project.statusDisplay}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-white">{formatDate(project.createdAt)}</span>
                            </div>
                            {project.completedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Completed</span>
                                    <span className="text-white">{formatDate(project.completedAt)}</span>
                                </div>
                            )}
                            {project.quoteId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Quote</span>
                                    <Link
                                        href={`/admin/quotes/detail?id=${project.quoteId}`}
                                        className="text-ocean-blue hover:underline text-xs"
                                    >
                                        #{project.quoteId} →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default function AdminProjectDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="h-6 bg-gray-800 rounded w-40 animate-pulse" />
                <div className="h-64 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
            </div>
        }>
            <AdminProjectDetailContent />
        </Suspense>
    )
}
