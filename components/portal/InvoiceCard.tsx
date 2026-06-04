import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

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

interface InvoiceCardProps {
    invoice: Invoice
    onPay?: () => void
}

export function InvoiceCard({ invoice, onPay }: InvoiceCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const formatInvoiceType = (type: string) => {
        return type === 'deposit' ? 'Deposit (50%)' : 'Final Balance'
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-heading font-bold text-gray-900">
                            Invoice #{invoice.id}
                        </h3>
                        <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                            {invoice.status}
                        </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p>
                            <span className="font-semibold">Type:</span> {formatInvoiceType(invoice.invoice_type)}
                        </p>
                        <p>
                            <span className="font-semibold">Project:</span> #{invoice.project_id}
                        </p>
                        <p>
                            <span className="font-semibold">Created:</span> {formatDate(invoice.created_at)}
                        </p>
                        {invoice.paid_at && (
                            <p>
                                <span className="font-semibold">Paid:</span> {formatDate(invoice.paid_at)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                        <p className="text-3xl font-heading font-bold text-ocean-blue">
                            ${invoice.amount.toFixed(2)}
                        </p>
                    </div>

                    {invoice.status === 'pending' && onPay && (
                        <Button variant="primary" onClick={onPay}>
                            Pay Now
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
