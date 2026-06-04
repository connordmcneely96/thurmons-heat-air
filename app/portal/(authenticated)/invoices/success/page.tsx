'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hopeful-teal"></div>
                    <p className="mt-4 text-gray-600">Processing your payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-forest-green" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your payment. Your invoice has been paid and a receipt has been sent to your email.
                </p>
                {sessionId && (
                    <p className="text-xs text-gray-400 mb-6">
                        Transaction ID: {sessionId}
                    </p>
                )}
                <div className="space-y-3">
                    <Link
                        href="/portal/invoices"
                        className="block w-full bg-hopeful-teal text-white py-2 px-4 rounded-md font-semibold hover:bg-hopeful-teal/90 transition-colors"
                    >
                        View All Invoices
                    </Link>
                    <Link
                        href="/portal/projects"
                        className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-200 transition-colors"
                    >
                        View Projects
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hopeful-teal"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    )
}
