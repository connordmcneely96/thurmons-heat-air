import { sendEmail } from '../lib/email';
import { Env } from '../types';
import { siteConfig } from '../../lib/site.config';

const { sea } = siteConfig;
const LOCATIONS = ['Attic', 'Basement', 'Closet', 'Crawl Space', 'Package Unit', 'Unknown'];
const CONTACT_METHODS = ['Email', 'Phone', 'Text'];
const MAX_SIGNATURE_CHARS = 400_000; // ~300KB PNG; a real signature is ~10-40KB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (v: unknown) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

function str(v: unknown, max: number): string {
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function list(v: unknown, allowed: string[]): string[] {
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && allowed.includes(x)) : [];
}

function priceFor(units: number) {
    return sea.firstUnitPrice + Math.max(units - 1, 0) * sea.additionalUnitPrice;
}

function row(label: string, value: string) {
    return `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:38%">${esc(label)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${value ? esc(value) : '<span style="color:#9ca3af">-</span>'}</td></tr>`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return json({ success: false, error: 'Invalid request' }, 400);
    }

    const d = {
        customerName: str(body.customerName, 150),
        email: str(body.email, 200).toLowerCase(),
        homePhone: str(body.homePhone, 30),
        cellPhone: str(body.cellPhone, 30),
        workPhone: str(body.workPhone, 30),
        serviceAddress: str(body.serviceAddress, 200),
        serviceCity: str(body.serviceCity, 100),
        serviceState: str(body.serviceState, 2).toUpperCase(),
        serviceZip: str(body.serviceZip, 10),
        billingSame: body.billingSame !== false,
        billingAddress: str(body.billingAddress, 200),
        billingCity: str(body.billingCity, 100),
        billingState: str(body.billingState, 2).toUpperCase(),
        billingZip: str(body.billingZip, 10),
        equipmentLocations: list(body.equipmentLocations, LOCATIONS),
        filterSizes: str(body.filterSizes, 200),
        wifiThermostat: body.wifiThermostat === 'yes' || body.wifiThermostat === 'no' ? body.wifiThermostat : '',
        contactPreferences: list(body.contactPreferences, CONTACT_METHODS),
        unitCount: Math.min(Math.max(Math.floor(Number(body.unitCount) || 1), 1), 10),
        signedName: str(body.signedName, 150),
        agreed: body.agreed === true,
        signature: typeof body.signature === 'string' ? body.signature : '',
    };

    // Validation
    if (!d.customerName) return json({ success: false, error: 'Customer name is required.' }, 400);
    if (!EMAIL_RE.test(d.email)) return json({ success: false, error: 'A valid email address is required.' }, 400);
    if (!d.homePhone && !d.cellPhone && !d.workPhone) return json({ success: false, error: 'At least one phone number is required.' }, 400);
    if (!d.serviceAddress || !d.serviceCity || !d.serviceState || !d.serviceZip)
        return json({ success: false, error: 'Complete service address is required.' }, 400);
    if (!d.billingSame && (!d.billingAddress || !d.billingCity || !d.billingState || !d.billingZip))
        return json({ success: false, error: 'Complete billing address is required, or check "same as service address".' }, 400);
    if (!d.agreed) return json({ success: false, error: 'You must agree to the Service Efficiency Agreement.' }, 400);
    if (!d.signedName) return json({ success: false, error: 'Please type your full name to sign.' }, 400);
    if (!d.signature.startsWith('data:image/png;base64,') || d.signature.length > MAX_SIGNATURE_CHARS)
        return json({ success: false, error: 'A valid signature is required.' }, 400);

    const annualPrice = priceFor(d.unitCount);
    const billing = d.billingSame
        ? { a: d.serviceAddress, c: d.serviceCity, s: d.serviceState, z: d.serviceZip }
        : { a: d.billingAddress, c: d.billingCity, s: d.billingState, z: d.billingZip };
    const ip = request.headers.get('cf-connecting-ip') || '';
    const ua = (request.headers.get('user-agent') || '').slice(0, 300);

    let id: number;
    try {
        const result = await env.DB.prepare(
            `INSERT INTO service_agreements (
                customer_name, email, home_phone, cell_phone, work_phone,
                service_address, service_city, service_state, service_zip,
                billing_address, billing_city, billing_state, billing_zip,
                equipment_locations, filter_sizes, wifi_thermostat, contact_preferences,
                unit_count, annual_price, agreement_version,
                signed_name, signature_data, signer_ip, signer_user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                d.customerName, d.email, d.homePhone || null, d.cellPhone || null, d.workPhone || null,
                d.serviceAddress, d.serviceCity, d.serviceState, d.serviceZip,
                billing.a, billing.c, billing.s, billing.z,
                JSON.stringify(d.equipmentLocations), d.filterSizes || null, d.wifiThermostat || null,
                JSON.stringify(d.contactPreferences),
                d.unitCount, annualPrice, sea.version,
                d.signedName, d.signature, ip || null, ua || null
            )
            .run();
        id = Number(result.meta?.last_row_id);
    } catch (error) {
        console.error('[SEA] Failed to save agreement:', error);
        return json({ success: false, error: `We could not save your agreement. Please call ${siteConfig.phone}.` }, 500);
    }

    const signedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'long', timeStyle: 'short' });
    const signatureBase64 = d.signature.slice('data:image/png;base64,'.length);
    const priceLine = `$${annualPrice} + tax per year (${d.unitCount} ${d.unitCount === 1 ? 'unit' : 'units'})`;

    const detailsTable = `
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin:16px 0">
            ${row('Agreement #', String(id))}
            ${row('Customer name', d.customerName)}
            ${row('Email', d.email)}
            ${row('Home phone', d.homePhone)}
            ${row('Cell phone', d.cellPhone)}
            ${row('Work phone', d.workPhone)}
            ${row('Service address', `${d.serviceAddress}, ${d.serviceCity}, ${d.serviceState} ${d.serviceZip}`)}
            ${row('Billing address', `${billing.a}, ${billing.c}, ${billing.s} ${billing.z}`)}
            ${row('Units covered', String(d.unitCount))}
            ${row('Annual price', priceLine)}
            ${row('Indoor equipment location', d.equipmentLocations.join(', '))}
            ${row('Filter sizes', d.filterSizes)}
            ${row('Wi-Fi thermostat', d.wifiThermostat ? (d.wifiThermostat === 'yes' ? 'Yes' : 'No') : '')}
            ${row('Preferred contact', d.contactPreferences.join(', '))}
            ${row('Signed by (typed name)', d.signedName)}
            ${row('Signed at', `${signedAt} (Central)`)}
        </table>`;

    const wrap = (inner: string) => `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
            <div style="background:#1E50C8;color:#ffffff;padding:20px 24px"><h1 style="margin:0;font-size:20px">Thurmon's Heat &amp; Air</h1><p style="margin:4px 0 0;opacity:.85">Service Efficiency Agreement</p></div>
            <div style="padding:24px">${inner}</div>
            <div style="padding:16px 24px;background:#f9fafb;font-size:12px;color:#6b7280">${esc(siteConfig.address.full)} &bull; ${esc(siteConfig.phone)}</div>
        </div></body></html>`;

    const attachment = [{ filename: `SEA-${id}-signature.png`, content: signatureBase64 }];
    const notificationEmail = env.NOTIFICATION_EMAIL || siteConfig.email;

    // Owner notification (non-fatal)
    try {
        const r = await sendEmail(env, {
            to: notificationEmail,
            subject: `New SEA Signup #${id} - ${d.customerName} (${priceLine})`,
            replyTo: d.email,
            html: wrap(`<p style="margin-top:0">A customer signed the ${esc(sea.version)} Service Efficiency Agreement online. Their signature is attached.</p>${detailsTable}<p>Reply to this email to reach the customer directly. All signed agreements are also in the admin panel under <strong>Agreements</strong>.</p>`),
            attachments: attachment,
        });
        if (!r.success) console.error('[SEA] Owner email failed:', r.error);
    } catch (e) {
        console.error('[SEA] Owner email exception:', e);
    }

    // Customer copy (non-fatal)
    try {
        const checklist = (title: string, items: readonly string[]) =>
            `<h3 style="margin:16px 0 6px;font-size:15px">${esc(title)}</h3><ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        const r = await sendEmail(env, {
            to: d.email,
            subject: `Your Service Efficiency Agreement #${id} - Thurmon's Heat & Air`,
            html: wrap(`<p style="margin-top:0">Hi ${esc(d.customerName)},</p>
                <p>Thank you for joining our Service Efficiency Agreement. This email is your copy of what you signed. Our office will contact you to schedule your first inspection.</p>
                ${detailsTable}
                <p><strong>Your agreement includes ${sea.visitsPerYear} inspections per year.</strong> ${esc(sea.perks)}</p>
                ${checklist('Heating Maintenance', sea.heating)}
                ${checklist('Cooling Maintenance', sea.cooling)}
                <p style="margin-top:20px">Questions? Call us at <strong>${esc(siteConfig.phone)}</strong> or reply to this email.</p>`),
            attachments: attachment,
        });
        if (!r.success) console.error('[SEA] Customer email failed:', r.error);
    } catch (e) {
        console.error('[SEA] Customer email exception:', e);
    }

    return json({ success: true, id, annualPrice });
};
