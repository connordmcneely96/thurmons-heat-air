'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/portal/AuthContext'

function InvoicePayContent() {
    const searchParams = useSearchParams()
    const { token } = useAuth()
    const invoiceId = searchParams.get('id')

    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')

    useEffect(() => {
        if (!invoiceId || !token) return

        async function initiatePayment() {
            try {
                const res = await fetch(`/api/payment/invoice/${invoiceId}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
                const data = await res.json() as any
                if (data.success && data.url) {
                    setStatus('redirecting')
                    window.location.href = data.url
                } else {
                    setError(data.error || data.details || 'Unable to start payment')
                    setStatus('error')
                }
            } catch {
                setError('Failed to start payment process')
                setStatus('error')
            }
        }

        initiatePayment()
    }, [invoiceId, token])

    if (!invoiceId) {
        return (
            <div className="text-center py-16 space-y-4">
                <p className="text-gray-500">Invalid payment link.</p>
                <Link href="/portal/invoices" className="text-sm text-ocean-blue hover:underline">
                    View all invoices
                </Link>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="text-center py-16 space-y-4">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-sm text-gray-500">
                    The invoice may already be paid or no longer available.
                </p>
                <Link href="/portal/invoices" className="text-sm text-ocean-blue hover:underline">
                    View all invoices
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
            <p className="text-gray-600 text-sm">
                {status === 'redirecting' ? 'Redirecting to secure payment...' : 'Preparing your payment...'}
            </p>
        </div>
    )
}

export default function InvoicePayPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
            </div>
        }>
            <InvoicePayContent />
        </Suspense>
    )
}
