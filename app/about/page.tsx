import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { siteConfig } from '@/lib/site.config'

export const metadata: Metadata = {
    title: "About Thurmon's Heat & Air | Local HVAC in El Dorado, AR",
    description:
        "Locally owned HVAC serving El Dorado and South Arkansas since 2013. Licensed, insured, and built on reliability, honest pricing, and work we stand behind.",
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
                            Local HVAC You Can Actually Count On
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Serving El Dorado and South Arkansas since {siteConfig.yearEstablished}, we started
                            Thurmon&apos;s because too many homeowners get burned by contractors who don&apos;t show
                            up, don&apos;t communicate, and don&apos;t stand behind their work. We do it differently
                            &mdash; fast, honest, and dependable, the way it should be.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why We Started Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Built on Doing Right by Our Neighbors
                        </h2>
                        <div className="w-16 h-1 bg-vibrant-gold rounded mb-10" />
                        {/* TODO: Replace with Keith's real founding story once confirmed with Lisa */}
                        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                            <p>
                                Heating and cooling problems never happen at a convenient time. When your
                                AC quits in July or your heat goes out on the coldest night of the year,
                                you need someone local who answers the phone and shows up fast.
                            </p>
                            <p>
                                Too often, homeowners get the opposite: technicians who run late or never
                                arrive, surprise charges that were never quoted, and high-pressure pitches
                                to replace a system that could have been repaired. People had simply learned
                                to expect it.
                            </p>
                            <p>
                                We have built Thurmon&apos;s Heat &amp; Air to be the opposite of that &mdash; a
                                local company, here since {siteConfig.yearEstablished}, where showing up on time,
                                quoting honestly, and standing behind the work is the whole point, not a bonus.
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
                                We run on four simple principles: quality workmanship, putting customers
                                first, genuine care for the job, and straightforward professionalism.
                            </p>
                            <p>
                                Here&apos;s what that actually looks like in practice:
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4">
                            {[
                                { label: 'We give you a quote', result: 'That is the price. No hidden fees, no surprise add-ons.' },
                                { label: 'We schedule a visit', result: 'We show up when we say, and we keep you posted.' },
                                { label: 'We finish a repair', result: 'We test the system and leave your home clean.' },
                                { label: 'You call after hours', result: 'We are on-call 24/7 with no extra after-hours charge.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                                    <div className="flex-shrink-0 w-2 rounded-full bg-vibrant-gold self-stretch" />
                                    <div>
                                        <span className="text-gray-500">When </span>
                                        <span className="font-semibold text-gray-900">{item.label}</span>
                                        <span className="text-gray-500"> &mdash; </span>
                                        <span className="text-gray-700">{item.result}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-8 text-lg text-gray-700 leading-relaxed">
                            We&apos;re not trying to be the biggest HVAC company around. We&apos;re trying to
                            be the one you trust, the one you recommend to your neighbors, and the one you
                            call year after year because you know exactly what you&apos;re going to get.
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
                                    title: 'Quality Workmanship',
                                    body: "We do not cut corners. Every repair and install gets the same attention to detail we would want in our own homes, and we test the system before we leave to make sure it is running right. New installs are backed by a 1-year labor warranty.",
                                },
                                {
                                    title: 'Customer-First',
                                    body: "Your comfort is the whole job. We explain the problem in plain language, give you honest options, and never pressure you into a sale you do not need. Service in English and Spanish.",
                                },
                                {
                                    title: 'Honest Pricing',
                                    body: "The quote we give you is the price you pay. No hidden fees, no surprise charges, and financing through Wells Fargo is available so a new system fits your budget.",
                                },
                                {
                                    title: 'Professionalism',
                                    body: "Licensed, insured, and accountable. We show up on time, do the job right the first time, and respect your home like it is our own. When we make a promise, we keep it.",
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
                                Why El Dorado Chooses Thurmon&apos;s
                            </h2>
                            <div className="w-16 h-1 bg-vibrant-gold rounded mx-auto" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: `Local since ${siteConfig.yearEstablished}`,
                                    body: "Not a national chain. We have served El Dorado and South Arkansas since 2013, and our reputation here is everything. Se habla espanol.",
                                },
                                {
                                    title: 'We know this climate',
                                    body: "South Arkansas summers are brutal and winters can turn fast. We know what your system goes through and how to keep it running.",
                                },
                                {
                                    title: `Licensed and insured (#${siteConfig.license})`,
                                    body: 'Your home is protected. Fully licensed Arkansas HVAC and insured, with no fine print.',
                                },
                                {
                                    title: '24/7 on-call, no extra charge',
                                    body: "When your AC or heat goes out, we move fast, with around-the-clock availability and no extra after-hours charge.",
                                },
                                {
                                    title: 'Warranty & seasonal care',
                                    body: "New installs carry a 1-year labor warranty, and we offer spring and fall visits at no extra charge to keep your system running.",
                                },
                                {
                                    title: 'Honest pricing & financing',
                                    body: "The quote we give you is the price you pay. No surprises, and Wells Fargo financing is available on new systems.",
                                },
                                {
                                    title: 'Satisfaction guarantee',
                                    body: "If you are not happy with the work, we make it right. Your comfort is how we measure success.",
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
                            Let&apos;s Get You Comfortable
                        </h2>
                        <p className="text-xl mb-10 text-white/85 leading-relaxed">
                            Whether you need an emergency repair, a tune-up, or a brand-new system, we&apos;re
                            here to help &mdash; and we&apos;d love to earn your trust.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/quote-request"
                                className="bg-white text-forest-green px-8 py-4 rounded-lg font-semibold hover:bg-vibrant-gold-50 transition-colors inline-block"
                            >
                                Get Your Free Estimate
                            </Link>
                            <a
                                href={`tel:${siteConfig.phoneRaw}`}
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-forest-green transition-colors inline-block"
                            >
                                Call Us: {siteConfig.phone}
                            </a>
                        </div>
                        <p className="mt-10 text-white/65 text-sm">
                            Join your neighbors across El Dorado and South Arkansas who have trusted Thurmon&apos;s
                            since {siteConfig.yearEstablished} to keep their homes comfortable year-round.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
