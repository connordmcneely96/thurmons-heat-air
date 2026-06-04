'use client'

import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { fetchWithAuth } from '@/lib/auth'

interface Invoice {
    id: number
    project_id: number
    amount: number
    invoice_type: 'deposit' | 'balance'
}

interface PaymentModalProps {
    invoice: Invoice
    onClose: () => void
    onSuccess: () => void
}

interface CheckoutFormProps {
    invoice: Invoice
    onClose: () => void
    onSuccess: () => void
}

function CheckoutForm({ invoice, onClose, onSuccess }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { addToast } = useToast()

    const transactionFee = (invoice.amount * 0.029 + 0.30).toFixed(2)
    const totalWithFee = (invoice.amount + parseFloat(transactionFee)).toFixed(2)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)
        setErrorMessage(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/portal/invoices/success/`,
            },
        })

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.')
            addToast({
                type: 'error',
                message: error.message || 'Payment failed',
            })
            setIsProcessing(false)
        } else {
            addToast({
                type: 'success',
                message: 'Payment successful! Thank you.',
            })
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Summary */}
            <div className="bg-warm-cream p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Invoice Amount:</span>
                    <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Transaction Fee:</span>
                    <span className="text-sm text-gray-600">${transactionFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-ocean-blue text-lg">${totalWithFee}</span>
                </div>
            </div>

            {/* Stripe Payment Element */}
            <div className="min-h-[200px]">
                <PaymentElement />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {/* Security Note */}
            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span>🔒</span>
                <p>
                    Your payment information is encrypted and secure. We use Stripe for payment processing.
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isProcessing || !stripe || !elements}
                >
                    {isProcessing ? 'Processing...' : `Pay $${totalWithFee}`}
                </Button>
            </div>
        </form>
    )
}

export function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addToast } = useToast()

    useEffect(() => {
        async function createPaymentIntent() {
            try {
                const endpoint = invoice.invoice_type === 'deposit'
                    ? '/api/payment/create-deposit'
                    : '/api/payment/create-balance'

                const response = await fetchWithAuth(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({
                        projectId: invoice.project_id,
                    }),
                })

                const data = await response.json() as any

                if (!data.success) {
                    throw new Error(data.error || 'Failed to initialize payment')
                }

                setClientSecret(data.clientSecret)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to initialize payment'
                setError(message)
                addToast({ type: 'error', message })
            } finally {
                setLoading(false)
            }
        }

        createPaymentIntent()
    }, [invoice.invoice_type, invoice.project_id, addToast])

    return (
        <Modal isOpen onClose={onClose} title="Complete Payment">
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-blue"></div>
                    <span className="ml-3 text-gray-600">Initializing payment...</span>
                </div>
            )}

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            )}

            {clientSecret && (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe',
                            variables: {
                                colorPrimary: '#2E5A8F',
                            },
                        },
                    }}
                >
                    <CheckoutForm
                        invoice={invoice}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                </Elements>
            )}
        </Modal>
    )
}
