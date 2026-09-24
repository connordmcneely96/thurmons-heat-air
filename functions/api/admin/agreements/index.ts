import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

interface AgreementRow {
    id: number;
    customer_name: string;
    email: string;
    home_phone: string | null;
    cell_phone: string | null;
    work_phone: string | null;
    service_address: string;
    service_city: string;
    service_state: string;
    service_zip: string;
    billing_address: string | null;
    billing_city: string | null;
    billing_state: string | null;
    billing_zip: string | null;
    equipment_locations: string | null;
    filter_sizes: string | null;
    wifi_thermostat: string | null;
    contact_preferences: string | null;
    unit_count: number;
    annual_price: number;
    agreement_version: string;
    signed_name: string;
    signature_data: string;
    signed_at: string;
    signer_ip: string | null;
    status: string;
    notes: string | null;
}

const parseList = (v: string | null): string[] => {
    try {
        const p = v ? JSON.parse(v) : [];
        return Array.isArray(p) ? p : [];
    } catch {
        return [];
    }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const auth = await requireAdmin(request, env);
    if (auth instanceof Response) return auth;

    try {
        const rows = await env.DB.prepare(
            `SELECT * FROM service_agreements ORDER BY signed_at DESC LIMIT 200`
        ).all<AgreementRow>();

        const agreements = (rows.results || []).map((r) => ({
            id: r.id,
            customerName: r.customer_name,
            email: r.email,
            homePhone: r.home_phone,
            cellPhone: r.cell_phone,
            workPhone: r.work_phone,
            serviceAddress: `${r.service_address}, ${r.service_city}, ${r.service_state} ${r.service_zip}`,
            billingAddress: r.billing_address
                ? `${r.billing_address}, ${r.billing_city}, ${r.billing_state} ${r.billing_zip}`
                : null,
            equipmentLocations: parseList(r.equipment_locations),
            filterSizes: r.filter_sizes,
            wifiThermostat: r.wifi_thermostat,
            contactPreferences: parseList(r.contact_preferences),
            unitCount: r.unit_count,
            annualPrice: r.annual_price,
            agreementVersion: r.agreement_version,
            signedName: r.signed_name,
            signatureData: r.signature_data,
            signedAt: r.signed_at,
            signerIp: r.signer_ip,
            status: r.status,
            notes: r.notes,
        }));

        return new Response(JSON.stringify({ success: true, agreements }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin agreements list error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to load agreements' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
