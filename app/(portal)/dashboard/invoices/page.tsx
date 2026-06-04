'use client'

import { useEffect, useState } from 'react'
import { InvoiceCard } from '@/components/portal/InvoiceCard'
import { PaymentModal } from '@/components/portal/PaymentModal'
import { fetchWithAuth } from '@/lib/auth'

interface Invoice {
    id: number
    project_id: number
    amount: number
    invoice_type: 'deposit' | 'balance'
    status: 'pending' | 'paid'
    stripe_payment_intent_id: string | null
    paid_at: string | null
    created_at: string
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        try {
            const response = await fetchWithAuth('/api/customer/invoices')
            const data = await response.json() as any

            if (data.success) {
                setInvoices(data.data)
            }
        } catch (error) {
            console.error('Failed to load invoices:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePayInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setShowPaymentModal(true)
    }

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false)
        setSelectedInvoice(null)
        loadInvoices()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-hopeful-teal border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading invoices...</p>
                </div>
            </div>
        )
    }

    const pendingInvoices = invoices.filter(inv => inv.status === 'pending')
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-ocean-blue mb-2">
                    Your Invoices
                </h1>
                <p className="text-gray-600">
                    View and pay your project invoices.
                </p>
            </div>

            {/* Pending Invoices */}
            {pendingInvoices.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                        Pending Payment ({pendingInvoices.length})
                    </h2>
                    <div className="space-y-4">
                        {pendingInvoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={invoice}
                                onPay={() => handlePayInvoice(invoice)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Paid Invoices */}
            {paidInvoices.length > 0 && (
                <div>
                    <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                        Payment History ({paidInvoices.length})
                    </h2>
                    <div className="space-y-4">
                        {paidInvoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={invoice}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {invoices.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center py-12">
                    <div className="text-5xl mb-4">💰</div>
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                        No invoices yet
                    </h3>
                    <p className="text-gray-600">
                        Your invoices will appear here once projects are scheduled.
                    </p>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <PaymentModal
                    invoice={selectedInvoice}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}
