'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { fetchWithAuth } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge'

interface Quote {
    id: number
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    serviceType: string
    serviceName: string
    propertySize: string | null
    quotedAmount: number | null
    status: string
    statusDisplay: string
    createdAt: string
    daysWaiting: number
    needsResponse: boolean
    depositStatus?: 'paid' | 'pending' | 'na'
}

interface QuoteSummary {
    pending: number
    quoted: number
    accepted: number
    declined: number
}

interface Pagination {
    currentPage: number
    totalPages: number
    totalQuotes: number
    hasMore: boolean
}

const STATUS_TABS = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'quoted', label: 'Quoted' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
]

const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    quoted: 'info',
    accepted: 'success',
    declined: 'destructive',
    expired: 'secondary',
    converted: 'success',
}

const PROPERTY_SIZE_LABELS: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    commercial: 'Commercial',
}

function AdminQuotesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const statusFilter = searchParams.get('status') || ''
    const pageParam = searchParams.get('page') || '1'

    const [quotes, setQuotes] = useState<Quote[]>([])
    const [summary, setSummary] = useState<QuoteSummary>({ pending: 0, quoted: 0, accepted: 0, declined: 0 })
    const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 0, totalQuotes: 0, hasMore: false })
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchQuotes = useCallback(async (status: string, page: string, searchQuery: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            params.set('page', page)
            params.set('limit', '10')
            if (searchQuery.trim()) params.set('search', searchQuery.trim())

            const res = await fetchWithAuth(`/api/admin/quotes?${params}`)
            if (res.ok) {
                const data = await res.json() as any
                if (data.success) {
                    setQuotes(data.quotes)
                    setSummary(data.summary)
                    setPagination(data.pagination)
                }
            }
        } catch (err) {
            console.error('Failed to fetch quotes:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchQuotes(statusFilter, pageParam, search)
    }, [statusFilter, pageParam, fetchQuotes]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleTabChange = (status: string) => {
        const params = new URLSearchParams()
        if (status) params.set('status', status)
        router.push(`/admin/quotes${params.toString() ? '?' + params.toString() : ''}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchQuotes(statusFilter, '1', search)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        params.set('page', String(page))
        router.push(`/admin/quotes?${params}`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Quotes</h1>
                <p className="text-sm text-gray-500 mt-1">Manage quote requests from customers</p>
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-3">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold text-yellow-400">{summary.pending}</span>
                    <span className="text-yellow-500 ml-1">Pending</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold text-blue-400">{summary.quoted}</span>
                    <span className="text-blue-500 ml-1">Quoted</span>
                </div>
                <div className="bg-forest-green/10 border border-forest-green/30 rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold text-vibrant-gold">{summary.accepted}</span>
                    <span className="text-vibrant-gold ml-1">Accepted</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold text-red-400">{summary.declined}</span>
                    <span className="text-red-500 ml-1">Declined</span>
                </div>
            </div>

            {/* Filter tabs + search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                statusFilter === tab.key
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:border-transparent w-full sm:w-64"
                    />
                    <Button type="submit" variant="outline" size="sm">Search</Button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
                    </div>
                ) : quotes.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No quotes found</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700 bg-gray-800">
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Customer</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Service</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Size</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Amount</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Deposit</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-400">Received</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {quotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-white">{quote.customerName || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{quote.customerEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{quote.serviceName}</td>
                                            <td className="px-4 py-3 text-gray-300">{PROPERTY_SIZE_LABELS[quote.propertySize || ''] || '—'}</td>
                                            <td className="px-4 py-3 text-gray-300 font-medium">
                                                {quote.quotedAmount !== null ? formatCurrency(quote.quotedAmount) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {quote.needsResponse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                                    <Badge variant={STATUS_BADGE[quote.status] || 'secondary'}>{quote.statusDisplay}</Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <PaymentStatusBadge status={quote.depositStatus ?? 'na'} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-300">{formatDate(quote.createdAt)}</p>
                                                {quote.daysWaiting > 0 && (
                                                    <p className={`text-xs ${quote.daysWaiting > 2 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                        {quote.daysWaiting}d ago
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/admin/quotes/detail?id=${quote.id}`}>
                                                    <Button variant={quote.status === 'pending' ? 'primary' : 'ghost'} size="sm">
                                                        {quote.status === 'pending' ? 'Respond' : 'View'}
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-gray-800">
                            {quotes.map((quote) => (
                                <Link key={quote.id} href={`/admin/quotes/detail?id=${quote.id}`} className="block p-4 hover:bg-gray-800/50">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-white">{quote.customerName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{quote.serviceName}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {quote.needsResponse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                            <Badge variant={STATUS_BADGE[quote.status] || 'secondary'}>{quote.statusDisplay}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{formatDate(quote.createdAt)}</span>
                                        {quote.quotedAmount !== null && (
                                            <span className="font-medium text-white">{formatCurrency(quote.quotedAmount)}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalQuotes} total)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage <= 1}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasMore}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AdminQuotesPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="h-8 bg-gray-800 rounded w-32 animate-pulse" />
                <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 animate-pulse" />
            </div>
        }>
            <AdminQuotesContent />
        </Suspense>
    )
}
