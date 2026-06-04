'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'

interface Quote {
    id: number
    serviceName: string
    description: string | null
    quotedAmount: number | null
    status: string
    statusDisplay: string
    createdAt: string
    quoteValidUntil: string | null
}

export default function QuotesPage() {
    const { token } = useAuth()
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadQuotes() {
            if (!token) return
            try {
                const res = await fetch('/api/customer/quotes', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json() as { success?: boolean; quotes?: Quote[] }
                if (data.success && Array.isArray(data.quotes)) {
                    setQuotes(data.quotes)
                }
            } catch (error) {
                console.error('Failed to fetch quotes', error)
            } finally {
                setLoading(false)
            }
        }

        void loadQuotes()
    }, [token])

    if (loading) {
        return <div className="p-4">Loading quotes...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
                <p className="text-sm text-gray-500 mt-1">Historical and active quotes from your account email</p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {quotes.length === 0 ? (
                        <li className="px-4 py-8 text-gray-500 text-center">No quotes found for your account yet.</li>
                    ) : (
                        quotes.map((quote) => (
                            <li key={quote.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Quote #{quote.id} — {quote.serviceName}</p>
                                        <p className="text-sm text-gray-600 mt-1">{quote.description || 'No description provided.'}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Created {new Date(quote.createdAt).toLocaleDateString()}
                                            {quote.quoteValidUntil ? ` • Valid until ${new Date(quote.quoteValidUntil).toLocaleDateString()}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {typeof quote.quotedAmount === 'number' ? `$${quote.quotedAmount.toFixed(2)}` : 'Pending'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{quote.statusDisplay}</p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}
