'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/portal/AuthContext'

interface InvoiceInfo {
    id: number
    label: string
    amount: number
    amountPaid: number
    balance: number
    status: string
    dueDate: string | null
}

function money(n: number) {
    return `$${n.toFixed(2)}`
}

function formatDue(dateStr: string | null) {
    if (!dateStr) return null
    const d = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function InvoicePayContent() {
    const searchParams = useSearchParams()
    const { token } = useAuth()
    const invoiceId = searchParams.get('id')

    const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
    const [amount, setAmount] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'redirecting' | 'error'>('loading')

    useEffect(() => {
        if (!invoiceId || !token) return
        let active = true
        ;(async () => {
            try {
                const res = await fetch(`/api/payment/invoice/${invoiceId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = (await res.json()) as { success?: boolean; invoice?: InvoiceInfo; error?: string }
                if (!active) return
                if (data.success && data.invoice) {
                    setInvoice(data.invoice)
                    setAmount(data.invoice.balance.toFixed(2))
                    setStatus('ready')
                } else {
                    setError(data.error || 'Unable to load invoice')
                    setStatus('error')
                }
            } catch {
                if (active) {
                    setError('Failed to load invoice')
                    setStatus('error')
                }
            }
        })()
        return () => { active = false }
    }, [invoiceId, token])

    const pay = useCallback(async () => {
        if (!invoice) return
        const value = Math.round(parseFloat(amount) * 100) / 100
        if (!Number.isFinite(value) || value < 1) {
            setError('Enter an amount of at least $1.00')
            return
        }
        if (value > invoice.balance + 0.01) {
            setError('Amount cannot exceed the balance due')
            return
        }
        setError(null)
        setStatus('submitting')
        try {
            const res = await fetch(`/api/payment/invoice/${invoice.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: value }),
            })
            const data = (await res.json()) as { success?: boolean; url?: string; error?: string }
            if (data.success && data.url) {
                setStatus('redirecting')
                window.location.href = data.url
            } else {
                setError(data.error || 'Unable to start payment')
                setStatus('error')
            }
        } catch {
            setError('Failed to start payment')
            setStatus('error')
        }
    }, [invoice, amount, token])

    if (!invoiceId) {
        return (
            <div className="text-center py-16 space-y-4">
                <p className="text-gray-500">Invalid payment link.</p>
                <Link href="/portal/invoices" className="text-sm text-forest-green hover:underline">View all invoices</Link>
            </div>
        )
    }

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green" />
                <p className="text-gray-600 text-sm">Loading invoice...</p>
            </div>
        )
    }

    if (status === 'error' && !invoice) {
        return (
            <div className="text-center py-16 space-y-4">
                <p className="text-red-600 font-medium">{error}</p>
                <Link href="/portal/invoices" className="text-sm text-forest-green hover:underline">View all invoices</Link>
            </div>
        )
    }

    if (invoice && invoice.balance <= 0) {
        return (
            <div className="text-center py-16 space-y-4">
                <p className="text-forest-green font-semibold text-lg">This invoice is paid in full.</p>
                <p className="text-sm text-gray-500">Thank you!</p>
                <Link href="/portal/invoices" className="text-sm text-forest-green hover:underline">View all invoices</Link>
            </div>
        )
    }

    if (!invoice) return null

    const due = formatDue(invoice.dueDate)
    const busy = status === 'submitting' || status === 'redirecting'

    return (
        <div className="max-w-md mx-auto py-10">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h1 className="text-2xl font-heading font-bold text-deep-charcoal mb-1">Pay Invoice #{invoice.id}</h1>
                <p className="text-gray-500 text-sm mb-6">{invoice.label}</p>

                <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-gray-500">Invoice total</span><span className="text-gray-800">{money(invoice.amount)}</span></div>
                    {invoice.amountPaid > 0 && (
                        <div className="flex justify-between"><span className="text-gray-500">Already paid</span><span className="text-gray-800">{money(invoice.amountPaid)}</span></div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                        <span className="font-semibold text-deep-charcoal">Balance due</span>
                        <span className="font-bold text-forest-green text-lg">{money(invoice.balance)}</span>
                    </div>
                    {due && (
                        <div className="flex justify-between"><span className="text-gray-500">Due by</span><span className="text-gray-800">{due}</span></div>
                    )}
                </div>

                <label htmlFor="pay-amount" className="block text-sm font-semibold text-deep-charcoal mb-1">Amount to pay</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                        id="pay-amount"
                        type="number"
                        min="1"
                        max={invoice.balance}
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={busy}
                        className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green outline-none"
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setAmount(invoice.balance.toFixed(2))} disabled={busy} className="text-xs font-semibold text-forest-green hover:underline">Pay full balance</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onClick={() => setAmount((Math.round((invoice.balance / 2) * 100) / 100).toFixed(2))} disabled={busy} className="text-xs font-semibold text-forest-green hover:underline">Pay half</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Pay the full balance or any amount toward it{due ? ` — you have until ${due}.` : '.'}
                </p>

                {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

                <button
                    type="button"
                    onClick={pay}
                    disabled={busy}
                    className="w-full mt-6 bg-forest-green text-white font-bold py-3 rounded-lg hover:bg-forest-green-700 transition-colors disabled:opacity-60"
                >
                    {status === 'redirecting' ? 'Redirecting to secure checkout...' : status === 'submitting' ? 'Starting payment...' : `Pay ${money(Math.min(parseFloat(amount) || 0, invoice.balance))}`}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">Payments are processed securely by Square.</p>

                <div className="text-center mt-4">
                    <Link href="/portal/invoices" className="text-sm text-gray-500 hover:text-forest-green hover:underline">Back to invoices</Link>
                </div>
            </div>
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
