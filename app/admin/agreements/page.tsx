'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface Agreement {
    id: number
    customerName: string
    email: string
    homePhone: string | null
    cellPhone: string | null
    workPhone: string | null
    serviceAddress: string
    billingAddress: string | null
    equipmentLocations: string[]
    filterSizes: string | null
    wifiThermostat: string | null
    contactPreferences: string[]
    unitCount: number
    annualPrice: number
    agreementVersion: string
    signedName: string
    signatureData: string
    signedAt: string
    signerIp: string | null
    status: string
    notes: string | null
}

const STATUSES = ['new', 'scheduled', 'active', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
    new: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
    scheduled: 'bg-blue-900/40 text-blue-400 border-blue-700',
    active: 'bg-green-900/40 text-green-400 border-green-700',
    cancelled: 'bg-gray-800 text-gray-400 border-gray-700',
}

const esc = (v: unknown) =>
    String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function printAgreement(a: Agreement) {
    const w = window.open('', '_blank', 'width=800,height=1000')
    if (!w) return
    const rows: [string, string][] = [
        ['Agreement #', String(a.id)],
        ['Customer name', a.customerName],
        ['Email', a.email],
        ['Home phone', a.homePhone || ''],
        ['Cell phone', a.cellPhone || ''],
        ['Work phone', a.workPhone || ''],
        ['Service address', a.serviceAddress],
        ['Billing address', a.billingAddress || a.serviceAddress],
        ['Units covered', String(a.unitCount)],
        ['Annual price', `$${a.annualPrice} + tax`],
        ['Indoor equipment location', a.equipmentLocations.join(', ')],
        ['Filter sizes', a.filterSizes || ''],
        ['Wi-Fi thermostat', a.wifiThermostat === 'yes' ? 'Yes' : a.wifiThermostat === 'no' ? 'No' : ''],
        ['Preferred contact', a.contactPreferences.join(', ')],
        ['Signed (typed name)', a.signedName],
        ['Signed at (UTC)', a.signedAt],
        ['Signer IP', a.signerIp || ''],
    ]
    w.document.write(`<!DOCTYPE html><html><head><title>SEA #${a.id} - ${esc(a.customerName)}</title>
        <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{margin:0}table{border-collapse:collapse;width:100%;margin:20px 0}td{border:1px solid #ccc;padding:8px;font-size:13px}td:first-child{background:#f5f5f5;font-weight:bold;width:35%}img{max-width:360px;border-bottom:1px solid #333}</style>
        </head><body>
        <h1>Thurmon's Heat and Air</h1>
        <p>1839 Champagnolle Rd., El Dorado, AR 71730 &bull; 870.866.5101</p>
        <h2>Service Efficiency Agreement (${esc(a.agreementVersion)})</h2>
        <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
        <p><strong>Customer Approval:</strong></p>
        <img src="${a.signatureData}" alt="Customer signature" />
        <p>${esc(a.signedName)}</p>
        <script>window.onload=function(){window.print()}</script>
        </body></html>`)
    w.document.close()
}

export default function AdminAgreementsPage() {
    const [agreements, setAgreements] = useState<Agreement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [updatingId, setUpdatingId] = useState<number | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth('/api/admin/agreements')
                const data = (await res.json()) as { success: boolean; agreements?: Agreement[]; error?: string }
                if (data.success && data.agreements) setAgreements(data.agreements)
                else setError(data.error || 'Failed to load agreements')
            } catch {
                setError('Failed to load agreements')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    async function updateStatus(id: number, status: string) {
        setUpdatingId(id)
        try {
            const res = await fetchWithAuth(`/api/admin/agreements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = (await res.json()) as { success: boolean }
            if (data.success) setAgreements((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))
        } finally {
            setUpdatingId(null)
        }
    }

    const newCount = agreements.filter((a) => a.status === 'new').length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Service Efficiency Agreements</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Signed online SEA signups{newCount > 0 ? ` - ${newCount} new to schedule` : ''}
                </p>
            </div>

            {loading ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-400">Loading agreements...</div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400">{error}</div>
            ) : agreements.length === 0 ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                    No agreements yet. Customers sign up at /service-agreement.
                </div>
            ) : (
                <div className="space-y-3">
                    {agreements.map((a) => (
                        <div key={a.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div
                                className="flex flex-wrap items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-800/50"
                                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                            >
                                <div className="flex-1 min-w-[180px]">
                                    <div className="font-medium text-white">#{a.id} &middot; {a.customerName}</div>
                                    <div className="text-xs text-gray-500">{a.serviceAddress}</div>
                                </div>
                                <div className="text-sm text-gray-300">
                                    {a.unitCount} {a.unitCount === 1 ? 'unit' : 'units'} &middot; ${a.annualPrice} + tax/yr
                                </div>
                                <div className="text-xs text-gray-400">{formatDate(a.signedAt)}</div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={a.status}
                                        disabled={updatingId === a.id}
                                        onChange={(e) => updateStatus(a.id, e.target.value)}
                                        className={`text-xs font-medium px-2 py-1 rounded-full border bg-transparent cursor-pointer disabled:opacity-50 ${STATUS_COLORS[a.status] || STATUS_COLORS.new}`}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s} className="bg-gray-900 text-white">
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {expandedId === a.id && (
                                <div className="border-t border-gray-800 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <dl className="space-y-2 text-gray-300">
                                        <div><dt className="text-gray-500 text-xs">Email</dt><dd><a href={`mailto:${a.email}`} className="text-blue-400 hover:underline">{a.email}</a></dd></div>
                                        <div><dt className="text-gray-500 text-xs">Phones</dt><dd>{[a.homePhone && `Home ${a.homePhone}`, a.cellPhone && `Cell ${a.cellPhone}`, a.workPhone && `Work ${a.workPhone}`].filter(Boolean).join(' · ') || '-'}</dd></div>
                                        <div><dt className="text-gray-500 text-xs">Billing address</dt><dd>{a.billingAddress || 'Same as service'}</dd></div>
                                        <div><dt className="text-gray-500 text-xs">Indoor equipment location</dt><dd>{a.equipmentLocations.join(', ') || '-'}</dd></div>
                                        <div><dt className="text-gray-500 text-xs">Filter sizes</dt><dd>{a.filterSizes || '-'}</dd></div>
                                        <div><dt className="text-gray-500 text-xs">Wi-Fi thermostat</dt><dd>{a.wifiThermostat ? (a.wifiThermostat === 'yes' ? 'Yes' : 'No') : '-'}</dd></div>
                                        <div><dt className="text-gray-500 text-xs">Preferred contact</dt><dd>{a.contactPreferences.join(', ') || '-'}</dd></div>
                                    </dl>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-2">Customer approval</div>
                                        <div className="bg-white rounded-lg p-2 inline-block">
                                            <img src={a.signatureData} alt={`Signature of ${a.signedName}`} className="max-w-full h-auto max-h-40" />
                                        </div>
                                        <div className="mt-2 text-gray-300">{a.signedName}</div>
                                        <div className="text-xs text-gray-500">Signed {a.signedAt} UTC{a.signerIp ? ` · IP ${a.signerIp}` : ''}</div>
                                        <button
                                            type="button"
                                            onClick={() => printAgreement(a)}
                                            className="mt-4 px-4 py-2 rounded-lg bg-forest-green text-white text-sm font-semibold hover:bg-forest-green/90"
                                        >
                                            Print / Save as PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
