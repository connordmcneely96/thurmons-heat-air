import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'About Evergrow Landscaping | Family-Owned in El Dorado & OKC',
    description:
        'Meet the team behind Evergrow Landscaping. Founded in 2023, serving El Dorado and Oklahoma City with reliable, quality landscaping services.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-vibrant-gold-50 py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-forest-green font-semibold uppercase tracking-widest text-sm mb-4">
                            Our Story
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                            More Than Just Landscaping —<br className="hidden md:block" /> It&apos;s Personal
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            We started Evergrow because we were tired of seeing homeowners get burned by
                            contractors who didn&apos;t show up, didn&apos;t communicate, and didn&apos;t care.
                            We built something different — a company where reliability is the foundation,
                            not a bonus.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why We Started Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Why We Started Evergrow
                        </h2>
                        <div className="w-16 h-1 bg-vibrant-gold rounded mb-10" />
                        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                            <p>
                                When Karson started Evergrow in 2023, he kept hearing the same frustrations
                                from homeowners: landscapers who didn&apos;t show up when promised, crews who
                                left properties messy, companies that added surprise charges, and contractors
                                who stopped answering the phone after getting paid.
                            </p>
                            <p>
                                Homeowners were spending their weekends trying to keep up with yard work
                                because they couldn&apos;t find someone reliable. When they did hire help,
                                they&apos;d get burned by poor communication, inconsistent quality, or
                                flat-out no-shows. &quot;Good enough&quot; seemed to be the industry standard,
                                and customers had learned to expect disappointment.
                            </p>
                            <p>
                                Karson saw an opportunity to build something different — a landscaping company
                                where reliability wasn&apos;t a bonus, it was the foundation. Where clear
                                communication was part of the service. Where quality work wasn&apos;t luck, it
                                was guaranteed. That vision became Evergrow Landscaping.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We're Different Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            How We&apos;re Different
                        </h2>
                        <div className="w-16 h-1 bg-vibrant-gold rounded mb-10" />
                        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                            <p>
                                We built Evergrow on four principles that still guide us today:
                                craftsmanship, putting customers first, genuine passion for the work,
                                and unwavering professionalism.
                            </p>
                            <p>
                                Here&apos;s what that actually looks like in practice:
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4">
                            {[
                                { label: 'We say Tuesday at 9am', result: 'We\'re there Tuesday at 9am.' },
                                { label: 'We give you a quote', result: 'That\'s the price. No hidden fees, no add-ons.' },
                                { label: 'We finish a job', result: 'Your property looks better than when we arrived.' },
                                { label: 'You call or text us', result: 'We respond within 24 hours. Every time.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                                    <div className="flex-shrink-0 w-2 rounded-full bg-vibrant-gold self-stretch" />
                                    <div>
                                        <span className="text-gray-500">When </span>
                                        <span className="font-semibold text-gray-900">{item.label}</span>
                                        <span className="text-gray-500"> — </span>
                                        <span className="text-gray-700">{item.result}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-8 text-lg text-gray-700 leading-relaxed">
                            We&apos;re not trying to be the biggest landscaping company in Oklahoma.
                            We&apos;re trying to be the one you trust, the one you recommend to your
                            neighbors, the one you call year after year because you know exactly
                            what you&apos;re going to get.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Our Commitment to You
                            </h2>
                            <div className="w-16 h-1 bg-vibrant-gold rounded mx-auto" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    title: 'Craftsmanship',
                                    body: "We don't cut corners. Every lawn, every flower bed, every project gets the same attention to detail we'd want for our own homes. Whether it's a weekly mowing or a complete landscape installation, your property gets our best work — guaranteed.",
                                },
                                {
                                    title: 'Customer-Centric',
                                    body: "Your satisfaction isn't just important — it's everything. We listen to your needs, communicate every step of the way, and make adjustments until you're completely happy. Have a concern? We want to hear it. Not satisfied? We'll make it right.",
                                },
                                {
                                    title: 'Passion',
                                    body: "We genuinely love what we do. There's something deeply satisfying about transforming an overgrown yard into a beautiful outdoor space, about seeing pride on a homeowner's face when they pull into their driveway. That passion drives us every day.",
                                },
                                {
                                    title: 'Professionalism',
                                    body: "Licensed, insured, and accountable — those aren't just checkboxes, they're commitments. We show up on time, do the job right the first time, and respect your property like it's our own. When we make a promise, we keep it. Non-negotiable.",
                                },
                            ].map((value) => (
                                <div key={value.title} className="bg-vibrant-gold-50 p-8 rounded-xl border border-vibrant-gold/20">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {value.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Homeowners Choose Evergrow
                            </h2>
                            <div className="w-16 h-1 bg-vibrant-gold rounded mx-auto" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: 'Family-owned and operated',
                                    body: "We're not a franchise or a national chain. You're working with real people who live in your community and care deeply about their reputation.",
                                },
                                {
                                    title: 'Serving Oklahoma & Arkansas since 2023',
                                    body: "We know this climate — what plants thrive here, when to fertilize, how to handle unpredictable seasonal weather. That local experience matters.",
                                },
                                {
                                    title: 'Licensed and insured',
                                    body: 'Your property is protected. If something goes wrong (it rarely does), you\'re covered. No exceptions, no fine print.',
                                },
                                {
                                    title: 'Background-checked crew',
                                    body: "Every person who comes to your property has been thoroughly vetted. Your safety and security are part of the service.",
                                },
                                {
                                    title: 'Transparent pricing',
                                    body: "The quote we give you is the price you pay. No hidden fees, no surprise charges, no 'oh, we forgot to mention' add-ons. Ever.",
                                },
                                {
                                    title: '24-hour response time',
                                    body: "Call, text, or email us with a question or concern and we'll respond within 24 hours. Usually much faster. We're here when you need us.",
                                },
                                {
                                    title: 'Quality guarantee',
                                    body: "If you're not happy with our work, we'll make it right. No arguments, no excuses. Your satisfaction is our success.",
                                    wide: true,
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className={`flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100${(item as { wide?: boolean }).wide ? ' md:col-span-2' : ''}`}
                                >
                                    <CheckCircle2 className="w-6 h-6 text-forest-green flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {item.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-forest-green text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Let&apos;s Work Together
                        </h2>
                        <p className="text-xl mb-10 text-white/85 leading-relaxed">
                            Ready to experience landscaping done right? Whether you need weekly lawn
                            care, a seasonal cleanup, or a complete landscape transformation — we&apos;re
                            here to help, and we&apos;d love to earn your trust.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/quote-request"
                                className="bg-white text-forest-green px-8 py-4 rounded-lg font-semibold hover:bg-vibrant-gold-50 transition-colors inline-block"
                            >
                                Get Your Free Quote
                            </Link>
                            <a
                                href="tel:+14054795794"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-forest-green transition-colors inline-block"
                            >
                                Call Us: 405-479-5794
                            </a>
                        </div>
                        <p className="mt-10 text-white/65 text-sm">
                            Join homeowners in El Dorado and Oklahoma City who trust Evergrow for
                            their landscaping needs. We&apos;ve been keeping our promises since day one.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
