import { formatDate } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

type Props = {
    status: 'paid' | 'pending' | 'na'
    paidAt?: string | null
    amount?: number | null
}

export default function PaymentStatusBadge({ status, paidAt, amount }: Props) {
    if (status === 'na') {
        return <span className="text-gray-400 text-sm">—</span>
    }

    if (status === 'paid') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Paid{paidAt ? ` · ${formatDate(paidAt)}` : ''}{amount ? ` · ${formatCurrency(amount)}` : ''}
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending{amount ? ` · ${formatCurrency(amount)}` : ''}
        </span>
    )
}
