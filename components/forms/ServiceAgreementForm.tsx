'use client'

import { useCallback, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site.config'
import { SignaturePad } from './SignaturePad'

const LOCATIONS = ['Attic', 'Basement', 'Closet', 'Crawl Space', 'Package Unit', 'Unknown']
const CONTACT_METHODS = ['Email', 'Phone', 'Text']
const { sea } = siteConfig

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1'

function priceFor(units: number) {
    return sea.firstUnitPrice + Math.max(units - 1, 0) * sea.additionalUnitPrice
}

type Form = {
    customerName: string
    email: string
    homePhone: string
    cellPhone: string
    workPhone: string
    serviceAddress: string
    serviceCity: string
    serviceState: string
    serviceZip: string
    billingSame: boolean
    billingAddress: string
    billingCity: string
    billingState: string
    billingZip: string
    equipmentLocations: string[]
    filterSizes: string
    wifiThermostat: '' | 'yes' | 'no'
    contactPreferences: string[]
    unitCount: number
    signedName: string
    agreed: boolean
}

const initial: Form = {
    customerName: '', email: '', homePhone: '', cellPhone: '', workPhone: '',
    serviceAddress: '', serviceCity: 'El Dorado', serviceState: 'AR', serviceZip: '',
    billingSame: true, billingAddress: '', billingCity: '', billingState: '', billingZip: '',
    equipmentLocations: [], filterSizes: '', wifiThermostat: '', contactPreferences: [],
    unitCount: 1, signedName: '', agreed: false,
}

export function ServiceAgreementForm() {
    const [form, setForm] = useState<Form>(initial)
    const [signature, setSignature] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState<{ id: number; price: number } | null>(null)

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))
    const toggle = (key: 'equipmentLocations' | 'contactPreferences', value: string) =>
        setForm((f) => ({
            ...f,
            [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
        }))
    const onSignature = useCallback((d: string | null) => setSignature(d), [])

    const price = priceFor(form.unitCount)
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!form.homePhone && !form.cellPhone && !form.workPhone) return setError('Please enter at least one phone number.')
        if (!signature) return setError('Please sign in the signature box.')
        if (!form.signedName.trim()) return setError('Please type your full name under your signature.')
        if (!form.agreed) return setError('Please check the box to agree to the Service Efficiency Agreement.')

        setSubmitting(true)
        try {
            const res = await fetch('/api/service-agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, signature }),
            })
            const data = (await res.json()) as { success: boolean; id?: number; annualPrice?: number; error?: string }
            if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong. Please try again or call us.')
            setDone({ id: data.id ?? 0, price: data.annualPrice ?? price })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again or call us.')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vibrant-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-forest-green" />
                </div>
                <h2 className="text-3xl font-heading font-bold text-forest-green mb-3">You&apos;re Signed Up!</h2>
                <p className="text-lg text-gray-600 mb-2">
                    Thank you for joining the Service Efficiency Agreement. A copy has been emailed to you.
                </p>
                <p className="text-gray-600 mb-6">
                    Our office will contact you to schedule your first inspection. Agreement #{done.id} &bull; ${done.price} + tax per year.
                </p>
                <p className="text-gray-600">
                    Questions? Call <a href={`tel:${siteConfig.phoneRaw}`} className="font-semibold text-forest-green underline">{siteConfig.phone}</a>.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-8" noValidate>
            {/* Customer */}
            <fieldset className="space-y-4">
                <legend className="text-xl font-bold text-deep-charcoal mb-2">Customer Information</legend>
                <div>
                    <label className={labelClass} htmlFor="customerName">Customer Name *</label>
                    <input id="customerName" className={inputClass} required autoComplete="name" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="email">Email Address *</label>
                    <input id="email" type="email" className={inputClass} required autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass} htmlFor="homePhone">Home Phone</label>
                        <input id="homePhone" type="tel" className={inputClass} autoComplete="tel" value={form.homePhone} onChange={(e) => set('homePhone', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass} htmlFor="cellPhone">Cell Phone</label>
                        <input id="cellPhone" type="tel" className={inputClass} value={form.cellPhone} onChange={(e) => set('cellPhone', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass} htmlFor="workPhone">Work Phone</label>
                        <input id="workPhone" type="tel" className={inputClass} value={form.workPhone} onChange={(e) => set('workPhone', e.target.value)} />
                    </div>
                </div>
                <p className="text-xs text-gray-500">At least one phone number is required.</p>
            </fieldset>

            {/* Service address */}
            <fieldset className="space-y-4">
                <legend className="text-xl font-bold text-deep-charcoal mb-2">Service Address</legend>
                <div>
                    <label className={labelClass} htmlFor="serviceAddress">Address *</label>
                    <input id="serviceAddress" className={inputClass} required autoComplete="street-address" value={form.serviceAddress} onChange={(e) => set('serviceAddress', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <label className={labelClass} htmlFor="serviceCity">City *</label>
                        <input id="serviceCity" className={inputClass} required value={form.serviceCity} onChange={(e) => set('serviceCity', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass} htmlFor="serviceState">State *</label>
                        <input id="serviceState" className={inputClass} required maxLength={2} value={form.serviceState} onChange={(e) => set('serviceState', e.target.value.toUpperCase())} />
                    </div>
                    <div>
                        <label className={labelClass} htmlFor="serviceZip">Zip Code *</label>
                        <input id="serviceZip" className={inputClass} required inputMode="numeric" maxLength={10} value={form.serviceZip} onChange={(e) => set('serviceZip', e.target.value)} />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-gray-700">
                    <input type="checkbox" className="h-4 w-4 accent-forest-green" checked={form.billingSame} onChange={(e) => set('billingSame', e.target.checked)} />
                    Billing address is the same as the service address
                </label>
                {!form.billingSame && (
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className={labelClass} htmlFor="billingAddress">Billing Address *</label>
                            <input id="billingAddress" className={inputClass} value={form.billingAddress} onChange={(e) => set('billingAddress', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="billingCity">City *</label>
                                <input id="billingCity" className={inputClass} value={form.billingCity} onChange={(e) => set('billingCity', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="billingState">State *</label>
                                <input id="billingState" className={inputClass} maxLength={2} value={form.billingState} onChange={(e) => set('billingState', e.target.value.toUpperCase())} />
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="billingZip">Zip Code *</label>
                                <input id="billingZip" className={inputClass} inputMode="numeric" maxLength={10} value={form.billingZip} onChange={(e) => set('billingZip', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
            </fieldset>

            {/* Equipment */}
            <fieldset className="space-y-4">
                <legend className="text-xl font-bold text-deep-charcoal mb-2">Your Equipment</legend>
                <div>
                    <label className={labelClass} htmlFor="unitCount">Number of HVAC units to cover *</label>
                    <select id="unitCount" className={inputClass} value={form.unitCount} onChange={(e) => set('unitCount', Number(e.target.value))}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'unit' : 'units'}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <span className={labelClass}>Indoor Equipment Location</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {LOCATIONS.map((loc) => (
                            <label key={loc} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-gray-700 cursor-pointer hover:border-forest-green">
                                <input type="checkbox" className="h-4 w-4 accent-forest-green" checked={form.equipmentLocations.includes(loc)} onChange={() => toggle('equipmentLocations', loc)} />
                                {loc}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass} htmlFor="filterSizes">Filter Sizes</label>
                        <input id="filterSizes" className={inputClass} placeholder="e.g. 16x25x1 (leave blank if unsure)" value={form.filterSizes} onChange={(e) => set('filterSizes', e.target.value)} />
                    </div>
                    <div>
                        <span className={labelClass}>Wi-Fi Thermostat</span>
                        <div className="flex gap-3">
                            {(['yes', 'no'] as const).map((v) => (
                                <label key={v} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 cursor-pointer hover:border-forest-green">
                                    <input type="radio" name="wifi" className="h-4 w-4 accent-forest-green" checked={form.wifiThermostat === v} onChange={() => set('wifiThermostat', v)} />
                                    {v === 'yes' ? 'Yes' : 'No'}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* Contact preference */}
            <fieldset>
                <legend className="text-xl font-bold text-deep-charcoal mb-3">How would you prefer to be contacted?</legend>
                <div className="flex flex-wrap gap-3">
                    {CONTACT_METHODS.map((m) => (
                        <label key={m} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 cursor-pointer hover:border-forest-green">
                            <input type="checkbox" className="h-4 w-4 accent-forest-green" checked={form.contactPreferences.includes(m)} onChange={() => toggle('contactPreferences', m)} />
                            {m}
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Price summary */}
            <div className="rounded-xl bg-forest-green/5 border border-forest-green/20 p-5">
                <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-deep-charcoal">Your annual agreement</span>
                    <span className="text-2xl font-bold text-forest-green">${price} <span className="text-base font-medium text-gray-600">+ tax / year</span></span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    ${sea.firstUnitPrice} for the first unit{form.unitCount > 1 ? ` + $${sea.additionalUnitPrice} × ${form.unitCount - 1} additional` : ''}. No payment is taken today. Our office will contact you to schedule and bill.
                </p>
            </div>

            {/* Signature */}
            <fieldset className="space-y-4">
                <legend className="text-xl font-bold text-deep-charcoal mb-2">Customer Approval</legend>
                <label className="flex items-start gap-3 text-gray-700">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-forest-green" checked={form.agreed} onChange={(e) => set('agreed', e.target.checked)} />
                    <span className="text-sm">
                        I agree to the {sea.version} Service Efficiency Agreement described on this page: {sea.visitsPerYear} inspections per year
                        for ${price} + tax per year. I agree that typing my name and signing below is my electronic signature and has the
                        same effect as signing a paper copy.
                    </span>
                </label>
                <SignaturePad onChange={onSignature} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass} htmlFor="signedName">Type your full name *</label>
                        <input id="signedName" className={inputClass} autoComplete="name" value={form.signedName} onChange={(e) => set('signedName', e.target.value)} />
                    </div>
                    <div>
                        <span className={labelClass}>Date</span>
                        <div className={`${inputClass} bg-gray-50 text-gray-600`}>{today}</div>
                    </div>
                </div>
            </fieldset>

            {error && (
                <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">{error}</div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-forest-green px-6 py-4 text-lg font-semibold text-white hover:bg-forest-green-700 disabled:opacity-60 transition-colors"
            >
                {submitting ? 'Submitting…' : 'Sign & Submit Agreement'}
            </button>
        </form>
    )
}
