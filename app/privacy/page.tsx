import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy | Evergrow Landscaping',
    description: 'Privacy Policy for Evergrow Landscaping. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
    return (
        <main>
            {/* Header */}
            <section className="bg-forest-green py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg text-white/80">Last updated: January 1, 2025</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="section bg-white">
                <div className="container">
                    <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">

                        <div className="bg-vibrant-gold-50 border-l-4 border-vibrant-gold p-6 rounded-r-lg mb-10">
                            <p className="text-gray-800 font-medium m-0">
                                Your privacy matters to us. This policy explains what information we collect when you use our website and services, and how we use and protect it.
                            </p>
                        </div>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you:</p>
                        <ul className="space-y-2 my-4">
                            <li>Request a quote or contact us through our website</li>
                            <li>Create a customer portal account</li>
                            <li>Apply for a job with us</li>
                            <li>Sign up for our newsletter</li>
                        </ul>
                        <p>This information may include your name, email address, phone number, service address, and any details you share about your landscaping needs.</p>
                        <p>We also automatically collect certain technical data when you visit our site, including your IP address, browser type, pages visited, and the time and date of your visit. This data is collected through standard server logs and analytics tools.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="space-y-2 my-4">
                            <li>Respond to your quote requests and service inquiries</li>
                            <li>Schedule and manage landscaping services</li>
                            <li>Send invoices and process payments</li>
                            <li>Communicate with you about your account or services</li>
                            <li>Improve our website and customer experience</li>
                            <li>Send service reminders and seasonal promotions (with your consent)</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                        <p>We do not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">3. Sharing Your Information</h2>
                        <p>We may share your information with trusted third parties who help us operate our business, including:</p>
                        <ul className="space-y-2 my-4">
                            <li><strong>Payment processors</strong> (Stripe) to securely handle billing</li>
                            <li><strong>Email service providers</strong> to send you receipts and communications</li>
                            <li><strong>Cloud storage providers</strong> to store project files and photos</li>
                        </ul>
                        <p>These third parties are contractually obligated to keep your information confidential and use it only for the specific services they provide to us.</p>
                        <p>We may also disclose your information if required by law, court order, or to protect the rights and safety of Evergrow Landscaping or others.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">4. Cookies</h2>
                        <p>Our website uses cookies — small text files stored on your device — to improve your browsing experience. Cookies help us remember your preferences and understand how visitors use our site.</p>
                        <p>You can control cookies through your browser settings. Disabling cookies may affect some features of our website, such as the customer portal login.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">5. Data Security</h2>
                        <p>We take the security of your information seriously. We use industry-standard encryption (SSL/TLS) to protect data transmitted to and from our website. Payment information is handled entirely by Stripe and is never stored on our servers.</p>
                        <p>While we take reasonable steps to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use strong, unique passwords for your customer portal account.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="space-y-2 my-4">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Opt out of marketing emails at any time</li>
                        </ul>
                        <p>To exercise any of these rights, contact us at <a href="mailto:contact@evergrowlandscaping.com" className="text-forest-green underline">contact@evergrowlandscaping.com</a>.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">7. Children's Privacy</h2>
                        <p>Our website and services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. We encourage you to review this policy periodically.</p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 mt-10 mb-4">9. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy or how we handle your information, please contact us:</p>
                        <div className="bg-gray-50 p-6 rounded-lg mt-4">
                            <p className="font-semibold text-gray-900 m-0">Evergrow Landscaping</p>
                            <p className="m-0">El Dorado, AR 71730</p>
                            <p className="m-0">Phone: <a href="tel:+14054795794" className="text-forest-green underline">405-479-5794</a></p>
                            <p className="m-0">Email: <a href="mailto:contact@evergrowlandscaping.com" className="text-forest-green underline">contact@evergrowlandscaping.com</a></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to footer links */}
            <section className="py-8 bg-gray-50 border-t border-gray-200">
                <div className="container text-center">
                    <Link href="/terms" className="text-forest-green hover:underline font-semibold mx-4">Terms of Service</Link>
                    <Link href="/sitemap" className="text-forest-green hover:underline font-semibold mx-4">Sitemap</Link>
                    <Link href="/" className="text-forest-green hover:underline font-semibold mx-4">Back to Home</Link>
                </div>
            </section>
        </main>
    )
}
