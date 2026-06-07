import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import { ServiceShowcase } from '@/components/services/ServiceShowcase'
import { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site.config'

export const metadata: Metadata = buildPageMetadata({
    title: 'Commercial HVAC in El Dorado, AR | Heating & Cooling for Businesses',
    description: 'Commercial heating and air conditioning for El Dorado businesses, offices, restaurants, and churches. Rooftop unit replacement, maintenance agreements, priority scheduling, and 24/7 emergency service.',
    path: '/commercial/',
})

const checkIcon = (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const features = [
    { icon: checkIcon, title: 'Minimize Downtime', description: 'We respond fast and work around your hours so your business stays open and comfortable.' },
    { icon: checkIcon, title: 'Maintenance Agreements', description: 'Scheduled tune-ups that catch small problems before they shut a system down at the worst time.' },
    { icon: checkIcon, title: 'Priority Scheduling', description: 'Commercial clients get prioritized scheduling, including 24/7 emergency availability.' },
    { icon: checkIcon, title: 'Licensed & Insured', description: `Fully licensed Arkansas HVAC (#${siteConfig.license}) and insured. Certificates available on request.` },
    { icon: checkIcon, title: 'Honest, Upfront Quotes', description: 'Clear pricing before the work starts. No surprise invoices, no pressure to over-replace.' },
    { icon: checkIcon, title: 'Any System Size', description: 'From a single rooftop unit to multiple systems across a building, we have you covered.' },
]

const showcaseItems = [
    {
        eyebrow: 'Commercial install',
        title: 'Equipped for Rooftop Units',
        body: 'When a commercial system has to go on the roof, we bring the right equipment and crew to do it safely. Here a new packaged rooftop unit is staged and rigged on site, ready for the lift, while the team coordinates the swap with as little disruption to the building as possible.',
        image: '/api/assets/services/commercial/rooftop-crane-stage.jpg',
        alt: 'A new packaged rooftop HVAC unit staged on a trailer with a crane set up on a commercial site',
    },
    {
        eyebrow: 'Whatever the job takes',
        title: 'Lifted, Set, and Tied In',
        body: 'The new unit goes up by crane, gets set in place, and is connected and tested before we leave. From a single rooftop unit to multiple systems across a building, we handle the heavy commercial work that keeps your doors open.',
        image: '/api/assets/services/commercial/rooftop-crane-lift.jpg',
        alt: 'A packaged rooftop HVAC unit hoisted in the air by a crane during a commercial installation',
    },
]

const process = [
    { number: '1', title: 'On-Site Assessment', description: 'We walk your property, evaluate your equipment, and learn how your space is actually used.' },
    { number: '2', title: 'Custom Proposal', description: 'You get clear, upfront pricing and a plan that fits your building and your budget.' },
    { number: '3', title: 'Scheduled Service', description: 'We work around your business hours to keep disruption to your staff and customers minimal.' },
    { number: '4', title: 'Ongoing Support', description: 'Optional maintenance agreements and priority service keep your systems running year-round.' },
]

const faqs = [
    { question: 'What kinds of businesses do you serve?', answer: 'Offices, retail, restaurants, churches, and other light-commercial properties throughout El Dorado and South Arkansas.' },
    { question: 'Do you replace rooftop units?', answer: 'Yes. We handle commercial rooftop package units, including crane-set replacements, and coordinate the work to minimize downtime for your business.' },
    { question: 'Do you offer maintenance agreements?', answer: 'Yes. Scheduled maintenance plans keep your equipment efficient and help prevent the breakdowns that interrupt your business.' },
    { question: 'How fast can you respond to a commercial emergency?', answer: 'Commercial clients receive priority scheduling, and we offer 24/7 emergency service for no-heat and no-cool situations.' },
    { question: 'Are you licensed and insured?', answer: 'Yes. We are fully licensed for HVAC in Arkansas and carry insurance. Certificates of insurance are available on request.' },
    { question: 'What size systems do you service?', answer: 'Everything from a single rooftop unit to multiple systems across a building. We will assess your setup and recommend the right approach.' },
]

export default function CommercialPage() {
    return (
        <main>
            {/* Commercial Hero */}
            <section className="relative bg-forest-green">
                <div className="absolute inset-0 bg-black/40" />
                <div className="container relative z-10 pt-32 pb-20">
                    <div className="max-w-4xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-vibrant-gold border border-white/20 mb-6 font-medium tracking-wide">
                            Commercial Heating &amp; Cooling
                        </span>
                        <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-7xl mb-4 leading-tight">
                            Keep Your Business Comfortable and Open
                        </h1>
                        <p className="text-white/90 text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed">
                            Reliable commercial HVAC service for El Dorado businesses. Fast response, honest pricing, and maintenance plans that prevent downtime.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/quote-request/commercial/">
                                <Button className="w-full sm:w-auto bg-vibrant-gold text-deep-charcoal hover:bg-vibrant-gold-600 border-0" size="lg">
                                    Request Commercial Proposal
                                </Button>
                            </Link>
                            <a href={`tel:${siteConfig.phoneRaw}`}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-forest-green"
                                >
                                    Call {siteConfig.phone}
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
                            <span>24/7 Emergency Service</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>Priority Commercial Scheduling</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-vibrant-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>Maintenance Agreements</span>
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
                                Run a business, office, or church?
                            </h2>
                            <p className="text-lg text-gray-600">
                                You cannot afford customers sweating or staff freezing while you wait days for a callback. Comfort problems cost you sales, productivity, and goodwill.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    The Current Headache
                                </h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li>&bull; Slow callbacks when a system goes down</li>
                                    <li>&bull; Surprise repair bills you never approved</li>
                                    <li>&bull; Comfort complaints from staff and customers</li>
                                    <li>&bull; Aging equipment nobody is keeping an eye on</li>
                                </ul>
                            </div>
                            <div className="bg-ocean-blue/5 p-8 rounded-xl border border-ocean-blue/10">
                                <h3 className="text-xl font-bold text-ocean-blue mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    The Thurmon&apos;s Solution
                                </h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>&bull; A local team that answers and responds fast</li>
                                    <li>&bull; Honest, upfront quotes before any work</li>
                                    <li>&bull; Maintenance plans that catch problems early</li>
                                    <li>&bull; Priority scheduling for commercial clients</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ServiceShowcase
                heading="Built for Bigger Jobs"
                intro="From a single rooftop unit to a full crane-set replacement, we bring the equipment and crew to handle the heavy commercial work."
                items={showcaseItems}
            />

            <ServiceFeatures features={features} />
            <ServiceProcess steps={process} />
            <ServiceFAQ faqs={faqs} />
            <ServiceCTA
                title="Keep Your Business Running"
                description={`Get a commercial proposal for your property today. Call ${siteConfig.phone} or request a proposal below.`}
                buttonText="Request Commercial Proposal"
                buttonLink="/quote-request/commercial/"
            />
        </main>
    )
}
