'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import Link from 'next/link'
import { FileText, CreditCard, CheckCircle } from 'lucide-react'

export default function InvoicesPage() {
    const { token } = useAuth()
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null)

    useEffect(() => {
        async function fetchInvoices() {
            if (!token) return
            try {
                const res = await fetch('/api/customer/invoices?limit=50', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json() as any
                if (data.success && data.invoices) {
                    setInvoices(data.invoices)
                }
            } catch (error) {
                console.error('Failed to fetch invoices', error)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoices()
    }, [token])

    async function handlePayNow(invoiceId: number) {
        setPayingInvoiceId(invoiceId)
        try {
            const res = await fetch(`/api/payment/invoice/${invoiceId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json() as any
            if (data.success && data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url
            } else {
                const reason = data.details || data.error || 'Unknown error'
                alert('Payment failed: ' + reason)
                setPayingInvoiceId(null)
            }
        } catch (error) {
            console.error('Payment error:', error)
            alert('Failed to start payment process')
            setPayingInvoiceId(null)
        }
    }

    if (loading) {
        return <div className="p-4">Loading invoices...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md overflow-x-auto">
                <ul role="list" className="divide-y divide-gray-200">
                    {invoices.length === 0 ? (
                        <li className="px-4 py-8 text-gray-500 text-center">
                            No invoices found.
                        </li>
                    ) : (
                        invoices.map((invoice: any) => (
                            <li key={invoice.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Invoice #{invoice.id}</span>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                       ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'pending' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {invoice.statusDisplay}
                                        </span>
                                    </div>

                                    <div className="sm:flex sm:justify-between sm:items-end">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600">{invoice.serviceName} - {invoice.invoiceTypeDisplay}</p>
                                            <p className="text-xs text-gray-400">Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt'}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                                            <span className="text-lg font-bold text-gray-900">${invoice.amount.toFixed(2)}</span>

                                            {invoice.canPay && (
                                                <button
                                                    onClick={() => handlePayNow(invoice.id)}
                                                    disabled={payingInvoiceId === invoice.id}
                                                    className="inline-flex items-center px-3 py-1.5 min-h-[44px] border border-transparent text-xs font-medium rounded shadow-sm text-white bg-hopeful-teal hover:bg-hopeful-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hopeful-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CreditCard className="h-3 w-3 mr-1" />
                                                    {payingInvoiceId === invoice.id ? 'Loading...' : 'Pay Now'}
                                                </button>
                                            )}

                                            {invoice.status === 'paid' && (
                                                <span className="flex items-center text-xs text-forest-green font-medium">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Paid {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ''}
                                                </span>
                                            )}
                                        </div>
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
