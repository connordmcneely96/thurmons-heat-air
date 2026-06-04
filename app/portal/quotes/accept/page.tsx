'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface QuoteDetails {
    id: number
    customerName: string
    serviceType: string
    description: string | null
    quotedAmount: number
    notes: string | null
    timeline: string | null
    terms: string | null
    validUntil: string
}

function QuoteAcceptContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addToast } = useToast()
    const token = searchParams.get('token')

    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [quote, setQuote] = useState<QuoteDetails | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing acceptance token')
            setLoading(false)
            return
        }

        // Load quote details
        async function loadQuote(validToken: string) {
            try {
                const res = await fetch(`/api/quotes/accept?token=${encodeURIComponent(validToken)}`)
                const data = await res.json() as any

                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Failed to load quote')
                }

                setQuote(data.quote)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load quote')
            } finally {
                setLoading(false)
            }
        }

        loadQuote(token)
    }, [token])

    const handleAccept = async () => {
        if (!token) return

        setAccepting(true)
        try {
            const res = await fetch('/api/quotes/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })

            const data = await res.json() as any

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to accept quote')
            }

            addToast({ type: 'success', message: 'Quote accepted successfully!' })
            router.push('/portal')
        } catch (err) {
            addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to accept quote' })
        } finally {
            setAccepting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green mx-auto mb-4" />
                    <p className="text-gray-400">Loading quote details...</p>
                </div>
            </div>
        )
    }

    if (error || !quote) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Unable to Load Quote</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link href="/">
                        <Button variant="outline">Return to Home</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-forest-green px-6 py-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Your Quote is Ready</h1>
                        <p className="text-white/75">Review and accept your landscaping quote below</p>
                    </div>

                    {/* Quote Details */}
                    <div className="p-6 space-y-6">
                        {/* Amount */}
                        <div className="bg-gray-800 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-400 mb-1">Total Quote Amount</p>
                            <p className="text-4xl font-bold text-forest-green">${quote.quotedAmount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-2">Valid until {new Date(quote.validUntil).toLocaleDateString()}</p>
                        </div>

                        {/* Service */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Service</h3>
                            <p className="text-white">{quote.serviceType}</p>
                        </div>

                        {/* Description */}
                        {quote.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Project Description</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{quote.description}</p>
                            </div>
                        )}

                        {/* Notes */}
                        {quote.notes && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Notes</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{quote.notes}</p>
                            </div>
                        )}

                        {/* Timeline */}
                        {quote.timeline && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Estimated Timeline</h3>
                                <p className="text-gray-300">{quote.timeline}</p>
                            </div>
                        )}

                        {/* Terms */}
                        {quote.terms && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Terms</h3>
                                <p className="text-gray-300">{quote.terms}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-800 space-y-3">
                            <Button
                                onClick={handleAccept}
                                variant="primary"
                                size="lg"
                                isLoading={accepting}
                                className="w-full bg-forest-green hover:bg-forest-green-700"
                            >
                                Accept Quote
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                                By accepting, you agree to our{' '}
                                <Link href="/terms" className="text-ocean-blue hover:underline">
                                    Terms of Service
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function QuoteAcceptPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green" />
            </div>
        }>
            <QuoteAcceptContent />
        </Suspense>
    )
}
