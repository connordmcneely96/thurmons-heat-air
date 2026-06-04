import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface ServiceHeroProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

export function ServiceHero({ title, description, imageSrc, imageAlt }: ServiceHeroProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-green/90 to-forest-green/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            {title}
          </h1>
          <p className="text-white/90 text-xl md:text-2xl mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/quote-request">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Free Quote
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
