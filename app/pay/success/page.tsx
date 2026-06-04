'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [loading, setLoading] = useState(true)
    const [warning, setWarning] = useState('')

    useEffect(() => {
        let isMounted = true

        async function confirmSession() {
            if (!sessionId) {
                if (isMounted) setLoading(false)
                return
            }

            try {
                const res = await fetch('/api/payment/confirm-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                })
                const data = await res.json() as { success?: boolean; error?: string }

                if (!data.success && isMounted) {
                    setWarning(data.error || 'Payment confirmation is still processing. Please refresh your portal in a minute.')
                }
            } catch {
                if (isMounted) {
                    setWarning('Payment confirmation is still processing. Please refresh your portal in a minute.')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        void confirmSession()

        return () => {
            isMounted = false
        }
    }, [sessionId])

    if (loading) {
        return (
            <section className="section">
                <div className="container">
                    <div className="max-w-md mx-auto text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hopeful-teal"></div>
                        <p className="mt-4 text-gray-600">Processing your payment...</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="container">
                <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-forest-green" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment has been processed successfully. A receipt has been sent to your email address.
                    </p>
                    {sessionId && (
                        <p className="text-xs text-gray-400 mb-6">
                            Transaction ID: {sessionId}
                        </p>
                    )}
                    {warning && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mb-6">
                            {warning}
                        </p>
                    )}
                    <div className="space-y-3">
                        <Link
                            href="/pay"
                            className="block w-full bg-hopeful-teal text-white py-2.5 px-4 rounded-md font-semibold hover:bg-hopeful-teal/90 transition-colors"
                        >
                            Pay Another Invoice
                        </Link>
                        <Link
                            href="/"
                            className="block w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-md font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function GuestPaymentSuccessPage() {
    return (
        <main>
            <section className="relative bg-forest-green py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4">Payment Successful</h1>
                    </div>
                </div>
            </section>
            <Suspense
                fallback={
                    <section className="section">
                        <div className="container">
                            <div className="max-w-md mx-auto text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hopeful-teal"></div>
                                <p className="mt-4 text-gray-600">Loading...</p>
                            </div>
                        </div>
                    </section>
                }
            >
                <SuccessContent />
            </Suspense>
        </main>
    )
}
