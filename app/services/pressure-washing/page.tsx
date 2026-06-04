import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Professional Equipment',
    description: 'Commercial-grade pressure washers with adjustable PSI for safe, effective cleaning of all surfaces.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Surface-Safe Techniques',
    description: 'We adjust pressure and techniques based on the surface material to prevent damage.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Eco-Friendly Cleaners',
    description: 'Optional biodegradable cleaning solutions for tough stains like oil, mildew, and algae.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast Service',
    description: 'Most residential pressure washing jobs completed in 2-4 hours with impressive results.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'Before/After Photos',
    description: 'We document the transformation so you can see exactly what you\'re getting for your investment.',
  },
]

const process = [
  {
    number: '1',
    title: 'Free Quote',
    description: 'Tell us what surfaces need cleaning and we\'ll provide a detailed quote. Most quotes given within 24 hours.',
  },
  {
    number: '2',
    title: 'Prep Work',
    description: 'We protect plants, cover outlets, and prep the area. Any fragile items should be moved before we arrive.',
  },
  {
    number: '3',
    title: 'Pressure Washing',
    description: 'Using the right pressure and technique for each surface, we remove dirt, mold, mildew, and stains.',
  },
  {
    number: '4',
    title: 'Final Rinse & Cleanup',
    description: 'We do a final rinse, remove any debris, and do a walkthrough to ensure you\'re satisfied.',
  },
]

const faqs = [
  {
    question: 'What surfaces can you pressure wash?',
    answer: 'We can safely clean driveways, sidewalks, patios, decks, fences, siding, garage floors, and more. Each surface is treated with appropriate pressure levels.',
  },
  {
    question: 'How much does pressure washing cost?',
    answer: 'Pricing depends on square footage and surface type. Driveways typically range from $100-$300, decks from $150-$400. We provide exact quotes after seeing the project.',
  },
  {
    question: 'Will pressure washing damage my surfaces?',
    answer: 'When done correctly with proper equipment and training, pressure washing is safe. We adjust PSI based on the surface (e.g., lower pressure for wood decks, higher for concrete).',
  },
  {
    question: 'How often should I pressure wash?',
    answer: 'We recommend annual pressure washing for most surfaces to prevent buildup of mold, mildew, and algae. High-traffic areas like driveways may benefit from twice-yearly cleaning.',
  },
  {
    question: 'Do I need to be home?',
    answer: 'Ideally yes, so we can show you the before/after results. However, if necessary, we can complete the work while you\'re away as long as we have access to water.',
  },
  {
    question: 'What about the 50% deposit?',
    answer: 'For pressure washing projects over $300, we require a 50% deposit to schedule the work. The remaining balance is due upon completion.',
  },
]

export default function PressureWashingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative bg-forest-green pt-20"
        style={{
          backgroundImage: "url('/api/assets/service-pressure-washing.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-12">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Pressure Washing &amp; Soft Washing
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Restore your home's curb appeal with professional pressure and soft washing. Driveways, decks, patios, siding, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quote-request">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">Get Free Quote</Button>
              </Link>
              <a href="tel:405-479-5794">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-forest-green">
                  Call (405) 479-5794
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-h2 font-heading text-forest-green mb-4">
                Years of Dirt, Mold, and Grime – Gone in Hours
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Oklahoma's humidity creates the perfect environment for mold, mildew, and algae. Over time, your once-bright driveway turns green, your deck gets slippery, and your home's siding loses its luster.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                You might think about renting a pressure washer from the hardware store. But here's the thing: too much pressure can etch concrete, splinter wood, and damage siding. Too little pressure won't actually clean anything.
              </p>
              <p className="text-lg text-gray-600">
                <strong>We have the right equipment and expertise to clean it safely – the first time.</strong>
              </p>
            </div>

            <div className="bg-vibrant-gold-50 border-l-4 border-forest-green p-6 rounded-lg">
              <h3 className="text-xl font-heading font-bold text-forest-green mb-3">
                What We Can Transform:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <h4 className="font-bold text-forest-green mb-2">Driveways & Walkways</h4>
                  <p className="text-sm">Remove oil stains, tire marks, dirt, and that green mildew buildup.</p>
                </div>
                <div>
                  <h4 className="font-bold text-forest-green mb-2">Decks & Patios</h4>
                  <p className="text-sm">Restore the original color and remove slippery algae growth.</p>
                </div>
                <div>
                  <h4 className="font-bold text-forest-green mb-2">Fences</h4>
                  <p className="text-sm">Brighten weathered wood and vinyl fencing.</p>
                </div>
                <div>
                  <h4 className="font-bold text-forest-green mb-2">Siding</h4>
                  <p className="text-sm">Gentle cleaning that won't damage paint or vinyl.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      {/* TODO: Gallery removed per client — Karson will provide assets for dedicated /gallery page */}
      <ServiceCTA
        title="See the Difference Pressure & Soft Washing Makes"
        description="Get a free quote and before/after photos. You'll be amazed at the transformation."
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Pressure Washing & Soft Washing Services',
  description: 'Professional pressure washing and soft washing services in Arkansas and Oklahoma for driveways, patios, siding, decks, and walkways.',
  path: '/services/pressure-washing/',
})
