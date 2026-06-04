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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'Complete Leaf Removal',
    description: 'We remove all leaves from lawns, beds, and hard surfaces. Nothing left behind.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Bed Maintenance',
    description: 'Trim back perennials, remove dead annuals, refresh mulch, and prepare beds for the season ahead.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Gutter Clearing',
    description: 'Optional gutter cleaning to prevent water damage and ice dams during winter months.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Hauling & Disposal',
    description: 'All debris is hauled away and disposed of properly. Your yard is left clean and ready.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Flexible Scheduling',
    description: 'Book spring cleanup (March-April) and fall cleanup (October-November) at discounted rates.',
  },
]

const process = [
  {
    number: '1',
    title: 'Schedule Your Cleanup',
    description: 'Book online or call us directly. We offer priority scheduling for recurring customers.',
  },
  {
    number: '2',
    title: 'We Assess & Quote',
    description: 'For larger properties, we may visit to provide an accurate quote. Most quotes are provided within 24 hours.',
  },
  {
    number: '3',
    title: 'Cleanup Day',
    description: 'Our crew arrives with commercial-grade equipment and completes the work efficiently. Most properties done in 2-4 hours.',
  },
  {
    number: '4',
    title: 'Final Walkthrough',
    description: 'We do a final check to ensure everything meets our standards. You\'ll receive photos of the completed work.',
  },
]

const faqs = [
  {
    question: 'How much does seasonal cleanup cost?',
    answer: 'Pricing depends on property size and scope of work. Most residential cleanups range from $150-$500. Spring cleanups are typically less than fall cleanups due to leaf volume.',
  },
  {
    question: 'When should I schedule spring cleanup?',
    answer: 'March-April is ideal for spring cleanup in Oklahoma. This prepares your yard for the growing season and removes winter debris.',
  },
  {
    question: 'When should I schedule fall cleanup?',
    answer: 'Late October through November is best for fall cleanup. We recommend scheduling after most leaves have fallen but before the first hard freeze.',
  },
  {
    question: 'Do you include gutter cleaning?',
    answer: 'Gutter cleaning is available as an add-on service. It\'s highly recommended with fall cleanup to prevent ice dams and water damage.',
  },
  {
    question: 'Can I combine cleanup with other services?',
    answer: 'Absolutely! Many customers bundle seasonal cleanup with flower bed refreshing or mulch installation at discounted rates.',
  },
  {
    question: 'Do you offer recurring seasonal cleanup?',
    answer: 'Yes! Sign up for both spring and fall cleanup and save 15%. We\'ll automatically schedule your cleanups each year.',
  },
]

export default function SeasonalCleanupPage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative bg-forest-green pt-20"
        style={{
          backgroundImage: "url('/api/assets/service-seasonal-cleanups.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-12">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Seasonal Cleanups
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Start each season with a fresh, clean yard. Professional leaf removal, bed maintenance, and debris cleanup.
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
                Don't Let Seasonal Debris Overwhelm Your Yard
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Leaves, dead plants, and winter debris don't just look bad – they can damage your lawn and create pest problems if left untreated.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We know what you're thinking: "I can just rake the leaves myself." Sure, you could. But it'll take you an entire weekend (or two), you'll need to rent or buy equipment, and you'll still need to figure out how to dispose of all that debris.
              </p>
              <p className="text-lg text-gray-600">
                <strong>We'll have it done in a few hours – and you won't lift a finger.</strong>
              </p>
            </div>

            <div className="bg-vibrant-gold-50 border-l-4 border-forest-green p-6 rounded-lg">
              <h3 className="text-xl font-heading font-bold text-forest-green mb-3">
                What's Included in Our Seasonal Cleanup:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Complete leaf removal</strong> from lawns, beds, driveways, and patios using commercial blowers and vacuums.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Flower bed cleanup</strong> including removing dead annuals, trimming perennials, and refreshing mulch.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Branch and debris removal</strong> from winter storms or summer storms.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Complete haul-away</strong> of all debris. We don't just pile it on the curb.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      {/* TODO: Gallery removed per client — Karson will provide assets for dedicated /gallery page */}
      {/* NOTE: seasonal-cleanup-before.jpg contains a person and requires manual image editing (Photoshop/Canva) before use */}
      <ServiceCTA
        title="Ready for a Fresh Start This Season?"
        description="Book your seasonal cleanup today. Early booking gets priority scheduling."
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Seasonal Cleanup Services',
  description: 'Professional seasonal cleanup services in Arkansas and Oklahoma for spring and fall, including leaf removal, debris cleanup, and bed prep.',
  path: '/services/seasonal-cleanup/',
})
