'use client'

interface ServiceAreaMapProps {
  height?: number | string
  showBadge?: boolean
  className?: string
}

/**
 * Embeds a Google Maps iframe that surfaces the Evergrow Landscaping
 * GMB listing for El Dorado, AR. Clicking "View larger map" inside the
 * iframe opens the full Google Business Profile.
 *
 * No API key required – uses the free Maps search embed endpoint.
 */
export function ServiceAreaMap({
  height = 400,
  showBadge = true,
  className = '',
}: ServiceAreaMapProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-xl ${className}`}
      style={{ height: heightStyle }}
    >
      <iframe
        src="https://maps.google.com/maps?q=Evergrow+Landscaping+El+Dorado+AR&output=embed&hl=en&z=9"
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Evergrow Landscaping – Service Area Map"
        aria-label="Google Maps showing Evergrow Landscaping service area"
      />

      {showBadge && (
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          <p className="font-bold text-deep-charcoal text-sm">Service area updated weekly</p>
        </div>
      )}
    </div>
  )
}
