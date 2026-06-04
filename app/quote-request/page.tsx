import { QuoteForm } from '@/components/forms/QuoteForm'
import Link from 'next/link'

export default function QuoteRequestPage() {
    return (
        <main>
            {/* Commercial Redirect Banner */}
            <div className="bg-deep-charcoal border-b border-white/10">
                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                    <span className="text-white/80">
                        Are you a <span className="text-vibrant-gold font-semibold">property manager or business owner</span> with multiple locations?
                    </span>
                    <Link
                        href="/quote-request/commercial/"
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-vibrant-gold text-white font-semibold hover:bg-vibrant-gold/90 transition-colors whitespace-nowrap"
                    >
                        Get a Commercial Proposal
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-forest-green py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4 text-white">
                            Get Your Free Quote
                        </h1>
                        <p className="text-xl mb-6">
                            Tell us about your project and we'll provide a detailed quote within 24 hours.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Free Estimates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No Obligation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>24-Hour Response</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto -mt-20 relative z-10">
                        <QuoteForm />
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="section section-alt py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-h2 font-heading text-forest-green mb-10 text-center">
                            What Happens Next?
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-green text-white font-heading font-bold text-2xl mb-4 shadow-md">
                                    1
                                </div>
                                <h3 className="font-heading font-bold text-forest-green mb-2">
                                    We Review Your Request
                                </h3>
                                <p className="text-gray-600">
                                    Our team reviews your project details and assesses what's needed for an accurate quote.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-green text-white font-heading font-bold text-2xl mb-4 shadow-md">
                                    2
                                </div>
                                <h3 className="font-heading font-bold text-forest-green mb-2">
                                    You Receive a Detailed Quote
                                </h3>
                                <p className="text-gray-600">
                                    Within 24 hours, we'll email you a transparent breakdown of costs, timeline, and what's included.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-green text-white font-heading font-bold text-2xl mb-4 shadow-md">
                                    3
                                </div>
                                <h3 className="font-heading font-bold text-forest-green mb-2">
                                    We Schedule Your Service
                                </h3>
                                <p className="text-gray-600">
                                    If you're happy with the quote, we'll schedule a convenient time and get to work.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export const metadata = {
    title: 'Get a Free Quote | Evergrow Landscaping',
    description: 'Request a free landscaping quote for El Dorado or Oklahoma City. No obligation, 24-hour response guaranteed.',
}
