import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service | Evergrow Landscaping',
    description: 'Terms of Service for Evergrow Landscaping. Read our service agreement, payment terms, and conditions for landscaping services in Arkansas and Oklahoma.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-forest-green text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-white/80 text-lg">Effective Date: January 1, 2024</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">

                        <div className="bg-vibrant-gold-50 border border-vibrant-gold/30 rounded-lg p-6 mb-10">
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Please read these Terms of Service carefully before using our services. By hiring Evergrow Landscaping or using our website, you agree to be bound by these terms. If you have questions, contact us at{' '}
                                <a href="mailto:contact@evergrowlandscaping.com" className="text-forest-green underline">contact@evergrowlandscaping.com</a>.
                            </p>
                        </div>

                        <div className="prose prose-lg max-w-none text-gray-700 space-y-10">

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Services</h2>
                                <p>
                                    Evergrow Landscaping (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides landscaping, lawn care, and related outdoor services to residential and commercial customers in Arkansas and Oklahoma. The specific services, pricing, and schedule for your project will be outlined in a written estimate or service agreement provided to you before work begins.
                                </p>
                                <p className="mt-3">
                                    We reserve the right to decline or discontinue service at our discretion, including if a property poses safety risks, access issues, or if payment obligations are not met.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Estimates and Pricing</h2>
                                <p>
                                    All estimates are provided in good faith based on information available at the time of the quote. Final pricing is confirmed in writing before work begins. If site conditions differ materially from what was assessed during the estimate (e.g., significantly more debris, hidden obstacles, or scope changes requested by the customer), we will notify you and obtain approval before proceeding with work that falls outside the original estimate.
                                </p>
                                <p className="mt-3">
                                    We do not add hidden fees or surprise charges. The price you approve is the price you pay for the agreed-upon scope of work.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
                                <p>
                                    Payment is due upon completion of service unless otherwise agreed in writing. For larger projects, we may require a deposit prior to scheduling. Accepted payment methods include cash, check, and major credit/debit cards.
                                </p>
                                <p className="mt-3">
                                    Invoices not paid within 30 days of the due date may be subject to a late fee of 1.5% per month on the outstanding balance. Accounts with past-due balances may have services suspended until the balance is resolved.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Scheduling and Cancellations</h2>
                                <p>
                                    We will make every reasonable effort to perform services on the scheduled date. However, services may be rescheduled due to severe weather, equipment failure, or other circumstances outside our control. In such cases, we will notify you as promptly as possible and reschedule at the earliest available opportunity.
                                </p>
                                <p className="mt-3">
                                    If you need to cancel or reschedule a service appointment, please provide at least 24 hours&apos; notice. Repeated last-minute cancellations may result in a scheduling fee or service termination.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Property Access</h2>
                                <p>
                                    You agree to provide safe and reasonable access to the property on scheduled service days. This includes ensuring gates are unlocked, pets are secured, and any obstacles that would prevent service are removed. If our crew arrives and cannot safely access the property, the visit may be counted as completed for billing purposes or rescheduled at our discretion.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Property Conditions and Liability</h2>
                                <p>
                                    We are fully licensed and insured. In the unlikely event our crew causes damage to your property as a direct result of our negligence, we will work with you promptly to address and remedy the situation.
                                </p>
                                <p className="mt-3">
                                    We are not liable for damage caused by pre-existing conditions (e.g., unmarked irrigation systems, buried utilities, unstable structures), acts of nature, or conditions outside our reasonable control. Please inform us of any underground utilities, sprinkler systems, or fragile features before service begins.
                                </p>
                                <p className="mt-3">
                                    You are responsible for ensuring underground utilities are marked before any digging or excavation services. In Arkansas, call 811 before you dig. In Oklahoma, call 811 or 1-800-522-6543.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Satisfaction Guarantee</h2>
                                <p>
                                    We stand behind our work. If you are not satisfied with a completed service, please notify us within 48 hours. We will return to address any legitimate concerns at no additional charge. This guarantee applies to the original scope of work and does not cover changes in preferences, natural plant/lawn deterioration, or conditions outside our control.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Website Use</h2>
                                <p>
                                    This website is provided for informational purposes and to facilitate service inquiries. You agree not to use this site for any unlawful purpose, to attempt to gain unauthorized access to any part of the site, or to interfere with the proper operation of the site.
                                </p>
                                <p className="mt-3">
                                    All content on this website — including text, images, and design — is the property of Evergrow Landscaping and may not be reproduced without written permission.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                                <p>
                                    To the maximum extent permitted by applicable law, Evergrow Landscaping&apos;s total liability for any claim arising from our services shall not exceed the amount you paid for the specific service giving rise to the claim. We are not liable for indirect, incidental, or consequential damages of any kind.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
                                <p>
                                    These Terms are governed by the laws of the State of Arkansas for services performed in Arkansas, and the laws of the State of Oklahoma for services performed in Oklahoma. Any disputes shall be resolved in the appropriate state or local courts of the jurisdiction where services were rendered.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to These Terms</h2>
                                <p>
                                    We may update these Terms of Service from time to time. Changes will be posted on this page with an updated effective date. Continued use of our services after changes are posted constitutes your acceptance of the updated terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                                <p>If you have questions about these Terms, please contact us:</p>
                                <div className="mt-4 bg-gray-50 rounded-lg p-6 not-prose">
                                    <p className="font-bold text-gray-900 mb-2">Evergrow Landscaping</p>
                                    <p className="text-gray-700">El Dorado, AR 71730</p>
                                    <p className="text-gray-700">
                                        Phone:{' '}
                                        <a href="tel:4054795794" className="text-forest-green hover:underline">405-479-5794</a>
                                    </p>
                                    <p className="text-gray-700">
                                        Email:{' '}
                                        <a href="mailto:contact@evergrowlandscaping.com" className="text-forest-green hover:underline">contact@evergrowlandscaping.com</a>
                                    </p>
                                </div>
                            </section>

                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
                            <Link href="/privacy" className="text-forest-green hover:underline">Privacy Policy</Link>
                            <Link href="/sitemap" className="text-forest-green hover:underline">Sitemap</Link>
                            <Link href="/contact" className="text-forest-green hover:underline">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
