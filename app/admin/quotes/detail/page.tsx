'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { fetchWithAuth } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import PhotoModal from '@/components/admin/PhotoModal'

const DEPOSIT_REQUIRED_SERVICES = new Set(['flower_beds', 'pressure_washing'])

interface Quote {
    id: number
    customerId: number | null
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    customerAddress: string | null
    serviceType: string
    serviceName: string
    propertySize: string | null
    description: string | null
    photoUrls: string[]
    quotedAmount: number | null
    status: string
    statusDisplay: string
    createdAt: string
    acceptedAt: string | null
    daysWaiting: number
    needsResponse: boolean
}

interface ExistingProject {
    id: number
    status: string
    statusDisplay: string
    scheduledDate: string | null
    scheduledTime: string | null
    depositPaid: boolean
    totalAmount: number
}

const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    quoted: 'info',
    accepted: 'success',
    declined: 'destructive',
    expired: 'secondary',
    converted: 'success',
}

const PROJECT_STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
}

const PROPERTY_SIZE_LABELS: Record<string, string> = {
    small: 'Small (under 5,000 sq ft)',
    medium: 'Medium (5,000 - 10,000 sq ft)',
    large: 'Large (10,000+ sq ft)',
    commercial: 'Commercial',
}

function QuoteDetailContent() {
    const searchParams = useSearchParams()
    const { addToast } = useToast()
    const quoteId = searchParams.get('id')

    const [quote, setQuote] = useState<Quote | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [modalState, setModalState] = useState<{ photos: string[]; index: number } | null>(null)

    // Send-quote form state
    const [quotedAmount, setQuotedAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [timeline, setTimeline] = useState('')
    const [terms, setTerms] = useState('')
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Decline quote state
    const [declining, setDeclining] = useState(false)

    // Existing project (when quote is accepted)
    const [existingProject, setExistingProject] = useState<ExistingProject | null>(null)
    const [projectLoading, setProjectLoading] = useState(false)

    // Schedule update form (for existing project)
    const [schedDate, setSchedDate] = useState('')
    const [schedTime, setSchedTime] = useState('')
    const [schedSubmitting, setSchedSubmitting] = useState(false)
    const [schedError, setSchedError] = useState<string | null>(null)
    const [schedSuccess, setSchedSuccess] = useState(false)

    // Cancel project
    const [cancelling, setCancelling] = useState(false)

    // Create-project form (fallback if no project exists yet)
    const [createDate, setCreateDate] = useState('')
    const [createTime, setCreateTime] = useState('')
    const [createNotes, setCreateNotes] = useState('')
    const [createSubmitting, setCreateSubmitting] = useState(false)
    const [createResult, setCreateResult] = useState<{ id: number } | null>(null)
    const [createError, setCreateError] = useState<string | null>(null)

    useEffect(() => {
        if (!quoteId) { setLoading(false); return }
        async function loadQuote() {
            try {
                const res = await fetchWithAuth(`/api/admin/quotes/${quoteId}`)
                if (res.ok) {
                    const data = await res.json() as any
                    if (data.success && data.quote) {
                        setQuote(data.quote)
                    }
                }
            } catch (err) {
                console.error('Failed to load quote:', err)
            } finally {
                setLoading(false)
            }
        }
        loadQuote()
    }, [quoteId])

    // When quote is accepted, fetch the associated project
    useEffect(() => {
        if (!quote || quote.status !== 'accepted') return
        setProjectLoading(true)
        fetchWithAuth(`/api/admin/projects?quoteId=${quote.id}&limit=1`)
            .then(res => res.ok ? res.json() : null)
            .then((data: any) => {
                if (data?.success && data.projects?.length > 0) {
                    const p = data.projects[0]
                    setExistingProject(p)
                    setSchedDate(p.scheduledDate || '')
                    setSchedTime(p.scheduledTime || '')
                }
            })
            .catch(() => {})
            .finally(() => setProjectLoading(false))
    }, [quote?.id, quote?.status])

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        const amount = parseFloat(quotedAmount)
        if (!quotedAmount || isNaN(amount)) {
            errors.quotedAmount = 'Please enter a valid amount'
        } else if (amount < 50) {
            errors.quotedAmount = 'Minimum quote amount is $50'
        } else if (amount > 10000) {
            errors.quotedAmount = 'Maximum quote amount is $10,000'
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        setSubmitting(true)
        try {
            const res = await fetchWithAuth(`/api/admin/quotes/${quoteId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    quotedAmount: parseFloat(quotedAmount),
                    notes: notes || undefined,
                    timeline: timeline || undefined,
                    terms: terms || undefined,
                }),
            })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send quote')
            addToast({ type: 'success', message: data.emailSent ? 'Quote sent to customer via email!' : 'Quote saved (email could not be sent)' })
            window.location.href = '/admin/quotes'
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send quote' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeclineQuote = async () => {
        if (!quote) return
        if (!confirm('Decline this quote? The customer will not be notified.')) return
        setDeclining(true)
        try {
            const res = await fetchWithAuth(`/api/admin/quotes/${quote.id}`, { method: 'PATCH' })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to decline quote')
            addToast({ type: 'success', message: 'Quote declined' })
            window.location.href = '/admin/quotes'
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to decline quote' })
        } finally {
            setDeclining(false)
        }
    }

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!existingProject || !schedDate) return
        setSchedSubmitting(true)
        setSchedError(null)
        setSchedSuccess(false)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${existingProject.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    scheduledDate: schedDate,
                    scheduledTime: schedTime || undefined,
                }),
            })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update schedule')
            setExistingProject({ ...existingProject, scheduledDate: schedDate, scheduledTime: schedTime || null })
            setSchedSuccess(true)
            addToast({ type: 'success', message: 'Schedule updated!' })
        } catch (err) {
            setSchedError(err instanceof Error ? err.message : 'Failed to update schedule')
        } finally {
            setSchedSubmitting(false)
        }
    }

    const handleCancelProject = async () => {
        if (!existingProject) return
        if (!confirm('Cancel this project? All pending invoices will also be cancelled.')) return
        setCancelling(true)
        try {
            const res = await fetchWithAuth(`/api/admin/projects/${existingProject.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled' }),
            })
            const data = await res.json() as any
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel project')
            setExistingProject({ ...existingProject, status: 'cancelled', statusDisplay: 'Cancelled' })
            addToast({ type: 'success', message: 'Project cancelled' })
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to cancel project' })
        } finally {
            setCancelling(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!quote || !createDate) return
        setCreateSubmitting(true)
        setCreateError(null)
        try {
            const depositRequired = DEPOSIT_REQUIRED_SERVICES.has(quote.serviceType)
            const res = await fetchWithAuth('/api/admin/projects', {
                method: 'POST',
                body: JSON.stringify({
                    quoteId: quote.id,
                    scheduledDate: createDate,
                    scheduledTime: createTime || undefined,
                    notes: createNotes || undefined,
                    depositRequired,
                }),
            })
            const data = await res.json() as any
            if (res.status === 409) {
                setCreateError('A project already exists. Refresh the page to see it.')
                return
            }
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create project')
            setCreateResult({ id: data.project.id })
            addToast({ type: 'success', message: 'Project scheduled!' })
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create project')
        } finally {
            setCreateSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-6 bg-gray-800 rounded w-32 animate-pulse" />
                <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 animate-pulse" />
            </div>
        )
    }

    if (!quoteId || !quote) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Quote not found</p>
                <Link href="/admin/quotes"><Button variant="outline">Back to Quotes</Button></Link>
            </div>
        )
    }

    const canDecline = quote.status === 'pending' || quote.status === 'quoted'

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/admin" className="hover:text-white">Dashboard</Link>
                <span>/</span>
                <Link href="/admin/quotes" className="hover:text-white">Quotes</Link>
                <span>/</span>
                <span className="text-white">#{quote.id}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">Quote #{quote.id}</h1>
                        <Badge variant={STATUS_BADGE[quote.status] || 'secondary'} className="text-sm">
                            {quote.statusDisplay}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Received {formatDate(quote.createdAt)}
                        {quote.daysWaiting > 0 && ` (${quote.daysWaiting} day${quote.daysWaiting !== 1 ? 's' : ''} ago)`}
                    </p>
                </div>
            </div>

            {/* Urgency banner */}
            {quote.needsResponse && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-red-400">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                    This quote has been waiting {quote.daysWaiting} day{quote.daysWaiting !== 1 ? 's' : ''} for a response
                </div>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Customer info */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Customer Information</h2>
                        </div>
                        <div className="p-5 grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                                <p className="text-sm font-medium text-white">{quote.customerName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                {quote.customerEmail ? (
                                    <a href={`mailto:${quote.customerEmail}`} className="text-sm font-medium text-ocean-blue hover:underline">{quote.customerEmail}</a>
                                ) : <p className="text-sm text-gray-400">—</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                                {quote.customerPhone ? (
                                    <a href={`tel:${quote.customerPhone}`} className="text-sm font-medium text-ocean-blue hover:underline">{quote.customerPhone}</a>
                                ) : <p className="text-sm text-gray-400">—</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                                <p className="text-sm text-white">{quote.customerAddress || '—'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Service details */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">Service Details</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Service Type</p>
                                    <p className="text-sm font-medium text-white">{quote.serviceName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Property Size</p>
                                    <p className="text-sm text-white">{PROPERTY_SIZE_LABELS[quote.propertySize || ''] || '—'}</p>
                                </div>
                            </div>
                            {quote.description && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3 whitespace-pre-wrap">{quote.description}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Photos */}
                    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                            <h2 className="font-semibold text-white text-sm">
                                Photos {quote.photoUrls.length > 0 ? `(${quote.photoUrls.length})` : ''}
                            </h2>
                        </div>
                        <div className="p-5">
                            {quote.photoUrls.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No photos submitted</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {quote.photoUrls.map((url, i) => (
                                        <div
                                            key={i}
                                            className="relative group cursor-pointer"
                                            onClick={() => setModalState({ photos: quote.photoUrls, index: i })}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Quote photo ${i + 1}`} className="w-full h-24 object-cover rounded" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center rounded">
                                                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">
                                                    View Full Size
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Photo Modal */}
                    {modalState && (
                        <PhotoModal
                            photos={modalState.photos}
                            initialIndex={modalState.index}
                            onClose={() => setModalState(null)}
                        />
                    )}
                </div>

                {/* Right column — Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status card (all non-pending quotes) */}
                    {quote.status !== 'pending' && (
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                            <h2 className="font-semibold text-white mb-3">Quote Status</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <Badge variant={STATUS_BADGE[quote.status] || 'secondary'}>{quote.statusDisplay}</Badge>
                                </div>
                                {quote.quotedAmount !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Quoted Amount</span>
                                        <span className="font-semibold text-white">{formatCurrency(quote.quotedAmount)}</span>
                                    </div>
                                )}
                                {quote.acceptedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Accepted</span>
                                        <span className="text-white">{formatDate(quote.acceptedAt)}</span>
                                    </div>
                                )}

                                {/* ── Accepted: project management ── */}
                                {quote.status === 'accepted' && (
                                    <div className="pt-3 border-t border-gray-800 space-y-3">
                                        {projectLoading ? (
                                            <p className="text-xs text-gray-500 animate-pulse">Loading project info…</p>
                                        ) : existingProject ? (
                                            <>
                                                {/* Project info */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Project #{existingProject.id}</span>
                                                    <Badge variant={PROJECT_STATUS_BADGE[existingProject.status] || 'secondary'} className="text-xs">
                                                        {existingProject.statusDisplay}
                                                    </Badge>
                                                </div>
                                                {existingProject.scheduledDate && (
                                                    <p className="text-xs text-gray-400">
                                                        Scheduled: {new Date(existingProject.scheduledDate).toLocaleDateString()}
                                                        {existingProject.scheduledTime && ` at ${existingProject.scheduledTime}`}
                                                    </p>
                                                )}

                                                {/* Update schedule form — only if not terminal */}
                                                {existingProject.status !== 'cancelled' && existingProject.status !== 'completed' && (
                                                    <>
                                                        <form onSubmit={handleUpdateSchedule} className="space-y-2 pt-1">
                                                            <p className="text-xs text-gray-500">
                                                                {existingProject.scheduledDate ? 'Update schedule' : 'Set schedule'}
                                                            </p>
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">
                                                                    Date <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    required
                                                                    value={schedDate}
                                                                    onChange={e => { setSchedDate(e.target.value); setSchedSuccess(false) }}
                                                                    className="w-full px-3 py-1.5 border border-gray-700 bg-gray-800 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Time (optional)</label>
                                                                <input
                                                                    type="time"
                                                                    value={schedTime}
                                                                    onChange={e => setSchedTime(e.target.value)}
                                                                    className="w-full px-3 py-1.5 border border-gray-700 bg-gray-800 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                                                />
                                                            </div>
                                                            {schedError && <p className="text-xs text-red-400">{schedError}</p>}
                                                            {schedSuccess && <p className="text-xs text-green-400">Schedule updated!</p>}
                                                            <Button type="submit" variant="secondary" size="sm" isLoading={schedSubmitting} className="w-full">
                                                                {existingProject.scheduledDate ? 'Update Schedule' : 'Set Schedule'}
                                                            </Button>
                                                        </form>

                                                        {/* Cancel project */}
                                                        <button
                                                            onClick={handleCancelProject}
                                                            disabled={cancelling}
                                                            className="w-full text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-600 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                                                        >
                                                            {cancelling ? 'Cancelling…' : 'Cancel Project'}
                                                        </button>
                                                    </>
                                                )}

                                                <Link href="/admin/projects" className="block text-xs text-center text-ocean-blue hover:underline pt-1">
                                                    View all projects →
                                                </Link>
                                            </>
                                        ) : (
                                            /* No project yet — creation form */
                                            <>
                                                <p className="text-xs text-gray-500">No project scheduled yet</p>
                                                {createResult ? (
                                                    <div className="bg-vibrant-gold-500/10 border border-forest-green-500/30 rounded-lg p-3 text-xs text-vibrant-gold space-y-2">
                                                        <p className="font-medium">Project #{createResult.id} created!</p>
                                                        <Link href="/admin/projects" className="underline">View in Projects →</Link>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleCreateProject} className="space-y-2">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">
                                                                Date <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                required
                                                                value={createDate}
                                                                onChange={e => setCreateDate(e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-gray-700 bg-gray-800 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Time (optional)</label>
                                                            <input
                                                                type="time"
                                                                value={createTime}
                                                                onChange={e => setCreateTime(e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-gray-700 bg-gray-800 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                                                            <textarea
                                                                rows={2}
                                                                value={createNotes}
                                                                onChange={e => setCreateNotes(e.target.value)}
                                                                placeholder="Crew notes, equipment…"
                                                                className="w-full px-3 py-1.5 border border-gray-700 bg-gray-800 text-white placeholder-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-blue resize-none"
                                                            />
                                                        </div>
                                                        {createError && <p className="text-xs text-red-400">{createError}</p>}
                                                        <Button type="submit" variant="primary" size="sm" isLoading={createSubmitting} className="w-full">
                                                            Schedule Project
                                                        </Button>
                                                    </form>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Decline button for pending / quoted */}
                                {canDecline && (
                                    <div className="pt-3 border-t border-gray-800">
                                        <button
                                            onClick={handleDeclineQuote}
                                            disabled={declining}
                                            className="w-full text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-600 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                                        >
                                            {declining ? 'Declining…' : 'Decline Quote'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Send Quote form */}
                    {quote.status === 'pending' && (
                        <form onSubmit={handleSendQuote} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="px-5 py-3 bg-forest-green border-b">
                                <h2 className="font-semibold text-white text-sm">Send Quote to Customer</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                                        Quoted Amount <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="50"
                                            max="10000"
                                            placeholder="0.00"
                                            value={quotedAmount}
                                            onChange={(e) => { setQuotedAmount(e.target.value); setFormErrors({}) }}
                                            className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:border-transparent bg-gray-800 text-white placeholder-gray-500 ${formErrors.quotedAmount ? 'border-red-300' : 'border-gray-700'}`}
                                        />
                                    </div>
                                    {formErrors.quotedAmount && <p className="text-xs text-red-600 mt-1">{formErrors.quotedAmount}</p>}
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes for Customer</label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        placeholder="Describe what's included, any conditions..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue resize-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-1">Estimated Timeline</label>
                                    <input
                                        id="timeline"
                                        type="text"
                                        placeholder='e.g., "2-3 hours" or "1 full day"'
                                        value={timeline}
                                        onChange={(e) => setTimeline(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="terms" className="block text-sm font-medium text-gray-300 mb-1">Special Terms</label>
                                    <input
                                        id="terms"
                                        type="text"
                                        placeholder="e.g., 50% deposit required"
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                    />
                                </div>

                                <div className="bg-ocean-blue/10 border border-ocean-blue/30 rounded-lg p-3 text-xs text-ocean-blue">
                                    <p className="font-medium mb-1">What happens when you send:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        <li>Customer receives an email with pricing details</li>
                                        <li>They get a link to accept the quote online</li>
                                        <li>Quote is valid for 30 days</li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    isLoading={submitting}
                                    className="w-full bg-forest-green hover:bg-forest-green-700 text-white"
                                >
                                    Send Quote to {quote.customerName || 'Customer'}
                                </Button>

                                <button
                                    type="button"
                                    onClick={handleDeclineQuote}
                                    disabled={declining}
                                    className="w-full text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-600 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                                >
                                    {declining ? 'Declining…' : 'Decline & Close'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Quick contact */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                        <h3 className="font-semibold text-white text-sm mb-3">Quick Contact</h3>
                        <div className="space-y-2">
                            {quote.customerPhone && (
                                <a href={`tel:${quote.customerPhone}`} className="flex items-center gap-2 text-sm text-ocean-blue hover:underline">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    {quote.customerPhone}
                                </a>
                            )}
                            {quote.customerEmail && (
                                <a href={`mailto:${quote.customerEmail}`} className="flex items-center gap-2 text-sm text-ocean-blue hover:underline">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    {quote.customerEmail}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminQuoteDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="h-6 bg-gray-800 rounded w-32 animate-pulse" />
                <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 animate-pulse" />
            </div>
        }>
            <QuoteDetailContent />
        </Suspense>
    )
}
