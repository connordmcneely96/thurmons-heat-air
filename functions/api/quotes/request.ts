import { Env } from '../../types';
import { sendEmail, getQuoteRequestNotificationEmail, getQuoteRequestConfirmationEmail } from '../../lib/email';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body: any = await request.json();
        const {
            name,
            email,
            phone,
            address,
            city,
            zipCode,
            zip_code,
            serviceType,
            service_type,
            propertySize,
            property_size,
            description,
            photoUrls,
        } = body;

        // Normalize field names (support both camelCase and snake_case)
        const normalizedZipCode = zipCode || zip_code;
        const normalizedServiceType = serviceType || service_type;
        let normalizedPropertySize = propertySize || property_size;

        // Map frontend property sizes to database allowed values
        // DB Constraint: CHECK(property_size IN ('small', 'medium', 'large', 'commercial'))
        const validPropertySizes = ['small', 'medium', 'large', 'commercial'];

        if (normalizedPropertySize === 'xlarge') {
            normalizedPropertySize = 'commercial';
        } else if (normalizedPropertySize === 'unsure' || !validPropertySizes.includes(normalizedPropertySize)) {
            normalizedPropertySize = null;
        }

        // Validate required fields
        if (!name || !email || !normalizedServiceType) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Name, email, and service type are required',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Server-side length limits to prevent abuse
        if (typeof name === 'string' && name.length > 200) {
            return new Response(JSON.stringify({ success: false, error: 'Name is too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (typeof phone === 'string' && phone.length > 30) {
            return new Response(JSON.stringify({ success: false, error: 'Phone number is too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (typeof address === 'string' && address.length > 500) {
            return new Response(JSON.stringify({ success: false, error: 'Address is too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (typeof description === 'string' && description.length > 2000) {
            return new Response(JSON.stringify({ success: false, error: 'Description must be 2000 characters or fewer' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email format',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Validate service area if zip code provided
        if (normalizedZipCode) {
            const serviceArea = await env.DB.prepare(`
        SELECT * FROM service_areas WHERE zip_code = ? AND is_active = 1
      `).bind(normalizedZipCode).first();

            if (!serviceArea) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Sorry, we do not currently service your area. Please call us to discuss options.',
                    outsideServiceArea: true,
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }

        // Convert photoUrls array to JSON string for storage
        const photoUrlsJson = photoUrls && Array.isArray(photoUrls) && photoUrls.length > 0
            ? JSON.stringify(photoUrls)
            : null;

        console.log('Saving quote request:', { name, email, serviceType: normalizedServiceType, photoCount: photoUrls?.length || 0 });

        // Insert quote request (try without photo_urls first if column doesn't exist)
        let result;
        try {
            result = await env.DB.prepare(`
              INSERT INTO quotes (
                contact_name, contact_email, contact_phone, contact_address,
                contact_city, contact_zip, service_type, property_size, description, photo_urls, status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `).bind(
                name.trim(),
                email.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                city?.trim() || null,
                normalizedZipCode?.trim() || null,
                normalizedServiceType,
                normalizedPropertySize || null,
                description?.trim() || null,
                photoUrlsJson
            ).run();
        } catch (dbError) {
            // If photo_urls column doesn't exist, try without it
            console.warn('Failed to insert with photo_urls, trying without:', dbError);
            result = await env.DB.prepare(`
              INSERT INTO quotes (
                contact_name, contact_email, contact_phone, contact_address,
                contact_city, contact_zip, service_type, property_size, description, status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `).bind(
                name.trim(),
                email.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                city?.trim() || null,
                normalizedZipCode?.trim() || null,
                normalizedServiceType,
                normalizedPropertySize || null,
                description?.trim() || null
            ).run();
        }

        if (!result.success) {
            throw new Error('Failed to save quote request');
        }

        // Format service type for display
        const serviceTypeDisplay = normalizedServiceType
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Send notification emails (don't fail the request if emails fail)
        try {
            const notificationEmail = env.NOTIFICATION_EMAIL || 'karson@evergrowlandscaping.com';

            // Send notification email to business owner
            await sendEmail(env, {
                to: notificationEmail,
                subject: `New Quote Request - ${serviceTypeDisplay}`,
                html: getQuoteRequestNotificationEmail({
                    name,
                    email,
                    phone,
                    address,
                    city,
                    zipCode: normalizedZipCode,
                    serviceType: serviceTypeDisplay,
                    propertySize: normalizedPropertySize,
                    description,
                    photoUrls: photoUrls && Array.isArray(photoUrls) ? photoUrls : undefined,
                }),
            });

            // Send confirmation email to customer
            await sendEmail(env, {
                to: email,
                subject: 'Quote Request Received - Evergrow Landscaping',
                html: getQuoteRequestConfirmationEmail(name, serviceTypeDisplay),
            });
        } catch (emailError) {
            // Log email error but don't fail the request
            console.error('Failed to send email notifications:', emailError);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Quote request submitted! We will contact you within 24 hours.',
            quoteId: result.meta.last_row_id,
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Quote request error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request';
        return new Response(JSON.stringify({
            success: false,
            error: errorMessage,
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
