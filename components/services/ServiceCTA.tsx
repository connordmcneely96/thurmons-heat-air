import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ServiceCTAProps {
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

export function ServiceCTA({
  title = "Ready to Get Started?",
  description = "Request your free quote today and discover why your neighbors trust Evergrow Landscaping.",
  buttonText = "Get Your Free Quote",
  buttonLink = "/quote-request"
}: ServiceCTAProps) {
  return (
    <section className="section bg-forest-green relative overflow-hidden">
      {/* Optional: Add a subtle overlay or pattern if needed to match new branding in future */}
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-h2 font-heading text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={buttonLink}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                {buttonText}
              </Button>
            </Link>
            <a href="tel:405-479-5794">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-forest-green"
              >
                Call (405) 479-5794
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
