'use client'

interface ServiceAreaMapProps {
  height?: number | string
  showBadge?: boolean
  className?: string
}

/**
 * Embeds a Google Maps iframe centered on Thurmon's Heat & Air in El Dorado, AR.
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
        src="https://maps.google.com/maps?q=1839+Champagnolle+Rd+El+Dorado+AR+71730&output=embed&hl=en&z=13"
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Thurmon's Heat &amp; Air – Service Area Map"
        aria-label="Google Maps showing Thurmon's Heat &amp; Air location in El Dorado, AR"
      />

      {showBadge && (
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          <p className="font-bold text-deep-charcoal text-sm">Service area updated weekly</p>
        </div>
      )}
    </div>
  )
}
