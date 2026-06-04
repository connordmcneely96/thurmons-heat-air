import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
    title: 'Commercial Exterior Maintenance | Arkansas and Oklahoma | Licensed and Insured',
    description: 'Professional Commercial Exterior Maintenance Services for properties small to large. Maintaining millions of square footage across Oklahoma and Arkansas.',
    path: '/commercial/',
})

const features = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: '🗺️ Multi-State Coverage',
        description: 'One vendor for all your locations in Arkansas and Oklahoma. Simplify your procurement process.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        title: '🧾 Unified Billing',
        description: 'Consolidated invoicing for your entire portfolio. We integrate with major property management platforms.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: '🛡️ Compliance & Safety',
        description: 'Fully licensed and insured. We meet rigorous corporate procurement requirements including background checks.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: '⚡ Rapid Response',
        description: '24/7 emergency storm response and prioritized scheduling for commercial clients.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: '👤 Owner-Managed',
        description: 'Direct accountability. Our leadership team is hands-on and accessible for high-level account reviews.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: '📈 Scalable Solutions',
        description: 'From single retail pads to large corporate campuses, we have the fleet and workforce to handle it.',
    },
]

const process = [
    {
        number: '1',
        title: 'Portfolio Audit',
        description: 'We review your locations to identify service gaps, savings opportunities, and potential risks.',
    },
    {
        number: '2',
        title: 'Custom Proposal',
        description: 'You get a unified proposal with transparent pricing and defined SLAs for all your properties.',
    },
    {
        number: '3',
        title: 'Seamless Onboarding',
        description: 'We handle the transition logistics, coordinating with your local managers to ensure zero service interruption.',
    },
    {
        number: '4',
        title: 'Account Review',
        description: 'Quarterly check-ins with your dedicated account manager to review performance and optimize spend.',
    },
]

const faqs = [
    {
        question: 'What areas do you service?',
        answer: 'We currently cover the entire states of Arkansas and Oklahoma. We are rapidly expanding our footprint to meet client needs.',
    },
    {
        question: 'Do you self-perform or subcontract?',
        answer: 'We are a self-performing landscaping company for our core markets. For specialized trades or remote locations, we manage a vetted network of partners to ensure consistent quality.',
    },
    {
        question: 'What are your insurance limits?',
        answer: 'We carry comprehensive General Liability, Auto, and Workers Compensation policies that meet or exceed standard corporate procurement requirements. Certificates available upon request.',
    },
    {
        question: 'Can you work with our procurement platform?',
        answer: 'Yes, we are experienced with major procurement and facility management platforms (e.g., Coupa, Ariba, ServiceChannel) for billing and work order management.',
    },
    {
        question: 'Do you offer snow and ice management?',
        answer: 'Yes, we provide 24/7 snow and ice management services for our commercial clients to ensure business continuity during winter weather events.',
    },
]

export default function CommercialPage() {
    return (
        <main>
            {/* Commercial Hero */}
            <section
                className="relative bg-forest-green"
                style={{
                    backgroundImage: "url('/api/assets/home-hero-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div className="container relative z-10 pt-32 pb-20">
                    <div className="max-w-4xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-vibrant-gold border border-white/20 mb-6 font-medium tracking-wide">
                            Multi-State Commercial Landscaping
                        </span>
                        <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-7xl mb-4 leading-tight">
                            One vendor. Every Property Handled.
                        </h1>
                        <p className="text-white/90 text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed">
                            Reliable, Consistent, and Hassle Free!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/quote-request/commercial/">
                                <Button className="w-full sm:w-auto bg-vibrant-gold text-white hover:bg-forest-green-700 border-0" size="lg">
                                    Request Commercial Proposal
                                </Button>
                            </Link>
                            <a href="tel:405-479-5794">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-forest-green"
                                >
                                    Call (405) 479-5794
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Strip */}
            <section className="bg-deep-charcoal py-8">
                <div className="container">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-white text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>Licensed &amp; Insured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>$2M+ Liability Insurance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>Consistent, Reliable, &amp; Accountable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>24/7 Emergency Contact</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem/Solution Section */}
            <section className="section bg-white">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-12 text-center">
                            <h2 className="text-h2 font-heading text-brand-charcoal mb-4">
                                Are you a property manager or a business owner?
                            </h2>
                            <p className="text-lg text-gray-600">
                                You shouldn't have to chase down vendors, decipher dozens of different invoices, or worry if the lawn was actually mowed at your satellite location.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    The Current Headache
                                </h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li>• Multiple vendors to vet and manage</li>
                                    <li>• Inconsistent quality across locations</li>
                                    <li>• Billing errors and reconciliation nightmares</li>
                                    <li>• "No-show" crews and safety liabilities</li>
                                </ul>
                            </div>
                            <div className="bg-ocean-blue/5 p-8 rounded-xl border border-ocean-blue/10">
                                <h3 className="text-xl font-bold text-ocean-blue mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    The Evergrow Solution
                                </h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>• Single partner for AR & OK</li>
                                    <li>• Standardized SOPs and quality checks</li>
                                    <li>• One consolidated monthly invoice</li>
                                    <li>• Proactive communication and reporting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ServiceFeatures features={features} />
            <ServiceProcess steps={process} />
            <ServiceFAQ faqs={faqs} />
            <ServiceCTA
                title="Ready to Streamline Your Landscape Management?"
                description="Get a comprehensive proposal for your portfolio today. Email us at karson@evergrowlandscaping.com or request a proposal below."
                buttonText="Request Commercial Proposal"
                buttonLink="/quote-request/commercial/"
            />
        </main>
    )
}
