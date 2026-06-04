'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CreditCard, FileText, Search, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

type Invoice = {
    id: number
    amount: number
    invoiceType: string
    invoiceTypeDisplay: string
    status: string
    statusDisplay: string
    serviceName: string
    createdAt: string
}

type GuestLookupResponse = {
    success: boolean
    invoices?: Invoice[]
    customerName?: string
    error?: string
}

type GuestCheckoutResponse = {
    success: boolean
    url?: string
    error?: string
    details?: string
}

function GuestPaymentContent() {
    const searchParams = useSearchParams()
    const initialEmail = useMemo(() => (searchParams.get('email') || '').trim(), [searchParams])
    const invoiceParam = useMemo(() => searchParams.get('invoice') || '', [searchParams])

    const [email, setEmail] = useState(initialEmail)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [customerName, setCustomerName] = useState('')
    const [looked, setLooked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        setEmail(initialEmail)
    }, [initialEmail])

    async function lookupInvoices(lookupEmail: string) {
        const res = await fetch('/api/payment/guest-lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: lookupEmail.trim() }),
        })
        return await res.json() as GuestLookupResponse
    }

    async function startCheckout(invoiceId: number, checkoutEmail: string) {
        const res = await fetch('/api/payment/guest-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId, email: checkoutEmail.trim() }),
        })
        return await res.json() as GuestCheckoutResponse
    }

    useEffect(() => {
        let isMounted = true

        async function tryDirectCheckout() {
            const invoiceId = Number.parseInt(invoiceParam, 10)
            if (!invoiceParam || !email || !Number.isInteger(invoiceId) || invoiceId <= 0) return

            setError('')
            setLoading(true)
            setPayingInvoiceId(invoiceId)

            try {
                const checkoutData = await startCheckout(invoiceId, email)
                if (!isMounted) return

                if (checkoutData.success && checkoutData.url) {
                    window.location.href = checkoutData.url
                    return
                }

                const lookupData = await lookupInvoices(email)
                if (!isMounted) return

                if (lookupData.success) {
                    setInvoices(lookupData.invoices || [])
                    setCustomerName(lookupData.customerName || '')
                    setLooked(true)
                    setError(checkoutData.details || checkoutData.error || 'Unable to start direct checkout. Please select an invoice below.')
                } else {
                    setError(checkoutData.details || checkoutData.error || lookupData.error || 'Unable to start payment session')
                }
            } catch {
                if (isMounted) setError('Failed to start payment. Please try again.')
            } finally {
                if (isMounted) {
                    setLoading(false)
                    setPayingInvoiceId(null)
                }
            }
        }

        void tryDirectCheckout()

        return () => {
            isMounted = false
        }
    }, [invoiceParam, email])

    async function handleLookup(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        setLooked(false)

        try {
            const data = await lookupInvoices(email)
            if (data.success) {
                setInvoices(data.invoices || [])
                setCustomerName(data.customerName || '')
                setLooked(true)
            } else {
                setError(data.error || 'Failed to look up invoices')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    async function handlePayNow(invoiceId: number) {
        setPayingInvoiceId(invoiceId)
        setError('')

        try {
            const data = await startCheckout(invoiceId, email)
            if (data.success && data.url) {
                window.location.href = data.url
            } else {
                setError(data.details || data.error || 'Failed to create payment session')
                setPayingInvoiceId(null)
            }
        } catch {
            setError('Failed to start payment. Please try again.')
            setPayingInvoiceId(null)
        }
    }

    return (
        <main>
            <section className="relative bg-forest-green py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4">Make a Payment</h1>
                        <p className="text-xl">Pay your invoice quickly and securely — no account login required.</p>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 mb-8">
                            <div className="flex items-center mb-6">
                                <Search className="h-6 w-6 text-hopeful-teal mr-3" />
                                <h2 className="text-xl font-heading font-bold text-gray-900">Find Your Invoice</h2>
                            </div>
                            <p className="text-gray-600 mb-6">Enter the email address associated with your account to view and pay pending invoices.</p>
                            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hopeful-teal focus:border-hopeful-teal outline-none text-gray-900"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-hopeful-teal text-white font-semibold rounded-lg hover:bg-hopeful-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {loading ? 'Searching...' : 'Look Up Invoices'}
                                </button>
                            </form>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {looked && (
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                {customerName && (
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            Showing invoices for <span className="font-semibold text-gray-900">{customerName}</span>
                                        </p>
                                    </div>
                                )}

                                {invoices.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <CheckCircle className="h-12 w-12 text-forest-green mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                                        <p className="text-gray-600">No pending invoices found for this email address. If you believe this is an error, please contact us.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {invoices.map((invoice) => (
                                            <li key={invoice.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900">Invoice #{invoice.id}</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">{invoice.statusDisplay}</span>
                                                </div>
                                                <div className="sm:flex sm:justify-between sm:items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-600">{invoice.serviceName} — {invoice.invoiceTypeDisplay}</p>
                                                    </div>
                                                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                                                        <span className="text-lg font-bold text-gray-900">${invoice.amount.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => handlePayNow(invoice.id)}
                                                            disabled={payingInvoiceId === invoice.id}
                                                            className="inline-flex items-center px-4 py-2 bg-hopeful-teal text-white text-sm font-semibold rounded-lg hover:bg-hopeful-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CreditCard className="h-4 w-4 mr-1.5" />
                                                            {payingInvoiceId === invoice.id ? 'Redirecting...' : 'Pay Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <div className="mt-8 text-center space-y-3">
                            <p className="text-gray-500 text-sm">Want to view payment history, project photos, and more?</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/portal/register" className="inline-flex items-center text-hopeful-teal font-semibold hover:underline">
                                    Create an Account
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <Link href="/portal/login" className="inline-flex items-center text-gray-600 font-medium hover:underline">
                                    Sign In
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default function GuestPaymentPage() {
    return (
        <Suspense fallback={<main className="section"><div className="container"><p className="text-gray-600">Loading payment options...</p></div></main>}>
            <GuestPaymentContent />
        </Suspense>
    )
}
