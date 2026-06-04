import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Sitemap | Evergrow Landscaping',
    description: 'Sitemap for Evergrow Landscaping. Find all pages on our website including services, about, contact, and more.',
}

interface SitemapSection {
    title: string
    links: { label: string; href: string; description?: string }[]
}

const sections: SitemapSection[] = [
    {
        title: 'Main Pages',
        links: [
            { label: 'Home', href: '/', description: 'Welcome to Evergrow Landscaping' },
            { label: 'About Us', href: '/about', description: 'Our story, values, and team' },
            { label: 'Contact', href: '/contact', description: 'Get in touch with us' },
            { label: 'Get a Free Quote', href: '/quote-request', description: 'Request a free estimate' },
            { label: 'Careers', href: '/careers', description: 'Join the Evergrow team' },
        ],
    },
    {
        title: 'Services',
        links: [
            { label: 'Lawn Care & Mowing', href: '/services/lawn-care', description: 'Regular mowing, edging, and lawn maintenance' },
            { label: 'Flower Bed Design', href: '/services/flower-beds', description: 'Custom flower bed installation and maintenance' },
            { label: 'Spring & Fall Cleanup', href: '/services/seasonal-cleanup', description: 'Seasonal property cleanup services' },
            { label: 'Pressure Washing', href: '/services/pressure-washing', description: 'Driveways, patios, siding, and more' },
        ],
    },
    {
        title: 'Commercial Services',
        links: [
            { label: 'Commercial Landscaping', href: '/commercial', description: 'Landscaping solutions for commercial properties' },
        ],
    },
    {
        title: 'Customer Portal',
        links: [
            { label: 'Login', href: '/login', description: 'Access your customer account' },
            { label: 'Register', href: '/register', description: 'Create a new customer account' },
            { label: 'Make a Payment', href: '/pay', description: 'Pay an invoice online' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/privacy', description: 'How we collect and use your information' },
            { label: 'Terms of Service', href: '/terms', description: 'Terms and conditions for our services' },
            { label: 'Sitemap', href: '/sitemap', description: 'You are here' },
        ],
    },
]

export default function SitemapPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-forest-green text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
                    <p className="text-white/80 text-lg">Everything you need, all in one place.</p>
                </div>
            </section>

            {/* Sitemap Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {sections.map((section) => (
                            <div key={section.title}>
                                <h2 className="text-lg font-bold text-forest-green mb-4 pb-2 border-b-2 border-vibrant-gold">
                                    {section.title}
                                </h2>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="group block"
                                            >
                                                <span className="font-semibold text-gray-900 group-hover:text-forest-green transition-colors">
                                                    {link.label}
                                                </span>
                                                {link.description && (
                                                    <span className="block text-sm text-gray-500 mt-0.5">
                                                        {link.description}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-vibrant-gold-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Can&apos;t find what you&apos;re looking for?</h2>
                    <p className="text-gray-600 mb-6">Our team is happy to help. Reach out and we&apos;ll get you pointed in the right direction.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="bg-forest-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-green-700 transition-colors"
                        >
                            Contact Us
                        </Link>
                        <a
                            href="tel:4054795794"
                            className="border-2 border-forest-green text-forest-green px-6 py-3 rounded-lg font-semibold hover:bg-forest-green hover:text-white transition-colors"
                        >
                            Call 405-479-5794
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
