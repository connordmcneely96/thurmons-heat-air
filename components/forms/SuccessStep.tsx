import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function SuccessStep() {
    return (
        <div className="text-center py-8">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-vibrant-gold-100 mb-6">
                <svg className="w-10 h-10 text-forest-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-3xl font-heading font-bold text-forest-green mb-4">
                Quote Request Submitted!
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Thank you! We've received your request and will send you a detailed quote within 24 hours.
            </p>

            {/* What's Next */}
            <div className="bg-vibrant-gold-50 p-6 rounded-lg mb-8 text-left max-w-md mx-auto border border-vibrant-gold-100">
                <h3 className="font-heading font-bold text-forest-green mb-4">
                    What Happens Next?
                </h3>
                <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-green text-white text-sm font-bold">
                            1
                        </span>
                        <span>
                            <strong>Check Your Email:</strong> You'll receive a confirmation message shortly.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-green text-white text-sm font-bold">
                            2
                        </span>
                        <span>
                            <strong>We Review Your Request:</strong> Our team will assess your project and prepare a detailed quote.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-green text-white text-sm font-bold">
                            3
                        </span>
                        <span>
                            <strong>Receive Your Quote:</strong> Within 24 hours, we'll email you a transparent breakdown of costs and timeline.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-green text-white text-sm font-bold">
                            4
                        </span>
                        <span>
                            <strong>Schedule Your Service:</strong> If you're happy with the quote, we'll schedule a convenient time.
                        </span>
                    </li>
                </ol>
            </div>

            {/* Contact Info */}
            <div className="text-gray-600 mb-8">
                <p className="mb-2">Have questions in the meantime?</p>
                <p className="font-semibold">
                    Call us at <a href="tel:4054795794" className="text-forest-green hover:underline">(405) 479-5794</a>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Monday-Saturday, 7AM-6PM
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                    <Button variant="outline" size="lg">
                        Return to Homepage
                    </Button>
                </Link>
                <Link href="/services">
                    <Button variant="primary" size="lg">
                        View Our Services
                    </Button>
                </Link>
            </div>
        </div>
    )
}
