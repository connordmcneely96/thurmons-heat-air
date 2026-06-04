'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const SERVICES = [
    'Lawn Care & Maintenance',
    'Landscaping & Design',
    'Seasonal Cleanups',
    'Pressure Washing & Soft Washing',
    'Snow & Ice Management',
    'Irrigation',
    'Other / Not Sure',
]

const LOCATION_COUNTS = [
    '1',
    '2–5',
    '6–10',
    '11–25',
    '26–50',
    '50+',
]

const PROPERTY_SIZES = [
    'Under 5,000 sq ft',
    '5,000 – 20,000 sq ft',
    '20,000 – 50,000 sq ft',
    '50,000 – 100,000 sq ft',
    '100,000 sq ft +',
    'Not Sure',
]

export default function CommercialQuotePage() {
    const [zip, setZip] = useState('')
    const [zipChecking, setZipChecking] = useState(false)
    const [zipError, setZipError] = useState('')
    const [zipVerified, setZipVerified] = useState(false)
    const [zipLocation, setZipLocation] = useState('')

    async function handleZipSubmit(e: React.FormEvent) {
        e.preventDefault()
        setZipError('')
        setZipChecking(true)
        try {
            const result = await api.validateZipCode(zip)
            if (result.data?.valid) {
                setZipLocation(result.data.location || '')
                setZipVerified(true)
            } else {
                setZipError(result.data?.message || 'Sorry, we don\'t currently serve this area.')
            }
        } catch {
            setZipError('Something went wrong. Please try again.')
        } finally {
            setZipChecking(false)
        }
    }

    const [form, setForm] = useState({
        contactName: '',
        companyName: '',
        email: '',
        phone: '',
        locationCount: '',
        propertySize: '',
        services: [] as string[],
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleServiceToggle(service: string) {
        setForm(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service],
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const message = [
            `Company: ${form.companyName}`,
            `Number of Locations: ${form.locationCount}`,
            `Property Size: ${form.propertySize}`,
            `Services Needed: ${form.services.length > 0 ? form.services.join(', ') : 'Not specified'}`,
            form.notes ? `Additional Notes: ${form.notes}` : '',
        ].filter(Boolean).join('\n')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.contactName,
                    email: form.email,
                    phone: form.phone,
                    message,
                    service_type: 'Commercial Proposal Request',
                }),
            })
            const data = await res.json() as { success?: boolean; error?: string }
            if (data.success) {
                setSubmitted(true)
            } else {
                setError(data.error || 'Something went wrong. Please try again.')
            }
        } catch {
            setError('Failed to submit. Please try again or call us directly.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!zipVerified) {
        return (
            <main>
                {/* Hero */}
                <section className="relative bg-forest-green py-16">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-vibrant-gold border border-white/20 mb-4 text-sm font-medium tracking-wide">
                                Commercial Services
                            </span>
                            <h1 className="text-h1 font-heading font-bold mb-4">
                                Request a Commercial Proposal
                            </h1>
                            <p className="text-xl mb-2 text-white/90">
                                Let's confirm we serve your area first.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="section py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <h2 className="text-2xl font-heading font-bold text-forest-green mb-2">
                                    Check Your Service Area
                                </h2>
                                <p className="text-gray-600 mb-6 text-sm">
                                    We serve commercial properties in Arkansas and Oklahoma. Enter your zip code to confirm coverage.
                                </p>
                                <form onSubmit={handleZipSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip">
                                            Property Zip Code
                                        </label>
                                        <input
                                            id="zip"
                                            type="text"
                                            value={zip}
                                            onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                            placeholder="Enter zip code"
                                            maxLength={5}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                                        />
                                        {zipError && <p className="text-sm text-red-600 mt-1">{zipError}</p>}
                                        {!zipError && <p className="text-xs text-gray-500 mt-1">We'll verify if we serve your area before proceeding</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={zipChecking || zip.length !== 5}
                                        className="w-full py-3 px-6 bg-forest-green text-white font-semibold rounded-lg hover:bg-forest-green/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {zipChecking ? 'Checking...' : 'Check Service Area'}
                                    </button>
                                </form>

                                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                                    <p className="font-semibold text-forest-green mb-1">Commercial Coverage:</p>
                                    <ul className="space-y-1">
                                        <li>• OKC metro and surrounding Oklahoma counties</li>
                                        <li>• El Dorado, AR and surrounding Arkansas areas</li>
                                    </ul>
                                    <p className="mt-3 text-gray-500">
                                        Outside our area?{' '}
                                        <a href="tel:405-479-5794" className="text-forest-green hover:underline font-medium">(405) 479-5794</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }

    if (submitted) {
        return (
            <main>
                <section className="relative bg-forest-green py-16">
                    <div className="container mx-auto px-4 text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4">Proposal Request Received!</h1>
                        <p className="text-xl max-w-xl mx-auto">
                            Thank you. Our commercial team will review your details and reach out within 1 business day.
                        </p>
                    </div>
                </section>
                <section className="section py-20 text-center">
                    <p className="text-gray-600 mb-6">In the meantime, feel free to learn more about what we offer.</p>
                    <Link href="/commercial" className="inline-block px-6 py-3 bg-forest-green text-white rounded-md font-medium hover:bg-forest-green/90 transition-colors">
                        Back to Commercial Services
                    </Link>
                </section>
            </main>
        )
    }

    return (
        <main>
            {/* Hero */}
            <section className="relative bg-forest-green py-16">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-vibrant-gold border border-white/20 mb-4 text-sm font-medium tracking-wide">
                            Commercial Services
                        </span>
                        <h1 className="text-h1 font-heading font-bold mb-4">
                            Request a Commercial Proposal
                        </h1>
                        <p className="text-xl mb-6 text-white/90">
                            Tell us about your portfolio and we'll put together a unified proposal for all your locations.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>No Obligation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>Unified Billing Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>AR &amp; OK Coverage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">

                            {/* Contact Info */}
                            <div>
                                <h2 className="text-lg font-semibold text-brand-charcoal mb-4 pb-2 border-b border-gray-100">Contact Information</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactName">
                                            Contact Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="contactName"
                                            name="contactName"
                                            type="text"
                                            required
                                            value={form.contactName}
                                            onChange={handleChange}
                                            placeholder="Jane Smith"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="companyName">
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="companyName"
                                            name="companyName"
                                            type="text"
                                            required
                                            value={form.companyName}
                                            onChange={handleChange}
                                            placeholder="Acme Properties LLC"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="jane@company.com"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="(555) 000-0000"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Details */}
                            <div>
                                <h2 className="text-lg font-semibold text-brand-charcoal mb-4 pb-2 border-b border-gray-100">Portfolio Details</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="locationCount">
                                            Number of Locations <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="locationCount"
                                            name="locationCount"
                                            required
                                            value={form.locationCount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white"
                                        >
                                            <option value="">Select...</option>
                                            {LOCATION_COUNTS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="propertySize">
                                            Typical Property Size
                                        </label>
                                        <select
                                            id="propertySize"
                                            name="propertySize"
                                            value={form.propertySize}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white"
                                        >
                                            <option value="">Select...</option>
                                            {PROPERTY_SIZES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div>
                                <h2 className="text-lg font-semibold text-brand-charcoal mb-4 pb-2 border-b border-gray-100">Services Needed</h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {SERVICES.map(service => (
                                        <label key={service} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={form.services.includes(service)}
                                                onChange={() => handleServiceToggle(service)}
                                                className="w-4 h-4 rounded border-gray-300 text-forest-green focus:ring-forest-green"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-forest-green transition-colors">{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                                    Additional Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Tell us about your properties, current vendor situation, specific requirements, or any questions you have..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 px-6 bg-vibrant-gold text-white font-semibold rounded-lg hover:bg-vibrant-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                            >
                                {submitting ? 'Submitting...' : 'Submit Proposal Request'}
                            </button>
                        </form>

                        {/* Trust badges */}
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            {[
                                { icon: '🛡️', label: 'Licensed & Insured' },
                                { icon: '📋', label: '$2M+ Liability' },
                                { icon: '🗺️', label: 'AR & OK Coverage' },
                                { icon: '⚡', label: '24/7 Emergency' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-1">
                                    <span className="text-2xl">{icon}</span>
                                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Prefer email?{' '}
                            <a href="mailto:karson@evergrowlandscaping.com" className="text-forest-green hover:underline font-medium">
                                karson@evergrowlandscaping.com
                            </a>
                            {' '}or call{' '}
                            <a href="tel:405-479-5794" className="text-forest-green hover:underline font-medium">
                                (405) 479-5794
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
