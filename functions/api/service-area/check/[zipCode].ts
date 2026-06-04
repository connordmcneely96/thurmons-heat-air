interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { params, env } = context;
    const zipCode = params.zipCode as string;

    try {
        if (!zipCode || zipCode.length !== 5) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid zip code format',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const area: any = await env.DB.prepare(`
      SELECT * FROM service_areas WHERE zip_code = ? AND is_active = 1
    `).bind(zipCode).first();

        if (area) {
            return new Response(JSON.stringify({
                success: true,
                serviced: true,
                city: area.city,
                region: area.region,
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
            success: true,
            serviced: false,
            message: 'We do not currently service this area.',
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Service area check error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to check service area',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
