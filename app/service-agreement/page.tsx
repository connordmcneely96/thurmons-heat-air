import type { Metadata } from 'next'
import { CheckCircle, Flame, Snowflake, Phone } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site.config'
import { ServiceAgreementForm } from '@/components/forms/ServiceAgreementForm'

const { sea } = siteConfig

export const metadata: Metadata = buildPageMetadata({
    title: 'Service Efficiency Agreement | HVAC Maintenance Plan in El Dorado, AR',
    description: `Join Thurmon's Heat & Air Service Efficiency Agreement: two HVAC inspections a year for $${sea.firstUnitPrice} + tax, no call-out fees or overtime rates. Sign up online in minutes.`,
    path: '/service-agreement',
})

export default function ServiceAgreementPage() {
    return (
        <main>
            <section className="relative bg-forest-green py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <span className="inline-block mb-4 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wider">
                            {sea.version} Maintenance Plan
                        </span>
                        <h1 className="text-h1 font-heading font-bold mb-4">Service Efficiency Agreement</h1>
                        <p className="text-xl text-white/90">
                            Two professional inspections a year, spring and fall, to keep your system efficient and extend its life.
                            Sign up online in a few minutes.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section bg-gray-50">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Plan details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-heading font-bold text-forest-green mb-4">Annual Cost</h2>
                                <p className="text-3xl font-bold text-deep-charcoal">
                                    ${sea.firstUnitPrice} <span className="text-lg font-medium text-gray-600">+ tax / 1 unit</span>
                                </p>
                                <p className="text-lg text-gray-700 mt-1">
                                    ${sea.additionalUnitPrice} + tax for each additional unit
                                </p>
                                <div className="mt-5 rounded-xl bg-vibrant-gold/15 p-4 font-semibold text-deep-charcoal">
                                    {sea.perks}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-deep-charcoal mb-3">
                                    <Flame className="w-5 h-5 text-forest-green" /> Heating Maintenance
                                </h3>
                                <ul className="space-y-2">
                                    {sea.heating.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-gray-700">
                                            <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-forest-green" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-deep-charcoal mb-3">
                                    <Snowflake className="w-5 h-5 text-forest-green" /> Cooling Maintenance
                                </h3>
                                <ul className="space-y-2">
                                    {sea.cooling.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-gray-700">
                                            <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-forest-green" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 text-gray-700">
                                <p className="font-semibold text-deep-charcoal mb-1">Prefer paper or have questions?</p>
                                <p>
                                    Call <a href={`tel:${siteConfig.phoneRaw}`} className="font-semibold text-forest-green underline inline-flex items-center gap-1"><Phone className="w-4 h-4" />{siteConfig.phone}</a> or
                                    email <a href={`mailto:${siteConfig.email}`} className="font-semibold text-forest-green underline break-all">{siteConfig.email}</a>.
                                </p>
                            </div>
                        </div>

                        {/* Signup form */}
                        <div className="lg:col-span-3">
                            <h2 className="text-h2 font-heading text-forest-green mb-2">Sign Up Online</h2>
                            <p className="text-gray-600 mb-6">
                                Fill out the form and sign below. We&apos;ll email you a copy and contact you to schedule your first inspection.
                            </p>
                            <ServiceAgreementForm />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
