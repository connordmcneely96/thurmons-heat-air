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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Custom Design',
    description: 'We work with you to create a flower bed design that complements your home and fits your budget.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Climate-Appropriate Plants',
    description: 'We select native and hardy plants that thrive in Oklahoma\'s climate and require less maintenance.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Soil Preparation',
    description: 'Proper bed preparation with quality soil, compost, and mulch for healthy, long-lasting plants.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast Installation',
    description: 'Most flower bed installations completed in 1-2 days with minimal disruption to your routine.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Maintenance Tips',
    description: 'We provide detailed care instructions and ongoing support to keep your beds looking beautiful.',
  },
]

const process = [
  {
    number: '1',
    title: 'Free Consultation & Design',
    description: 'We visit your property to discuss your vision, assess sunlight and soil conditions, and create a custom design. You\'ll receive detailed drawings and plant selections.',
  },
  {
    number: '2',
    title: 'Quote & Approval',
    description: 'Within 24 hours, you\'ll receive a detailed quote including materials, plants, and labor. Once approved, we collect a 50% deposit to order materials.',
  },
  {
    number: '3',
    title: 'Bed Preparation',
    description: 'We remove existing grass or weeds, define bed edges, and amend soil with compost and nutrients for optimal plant health.',
  },
  {
    number: '4',
    title: 'Planting & Finishing',
    description: 'Plants are installed according to the design, then we add mulch and edging. Final walkthrough ensures you\'re thrilled with the results.',
  },
]

const faqs = [
  {
    question: 'How much does a flower bed installation cost?',
    answer: 'Pricing depends on size, complexity, and plant selection. Most residential flower beds range from $500-$2,500. We provide exact quotes after the initial consultation.',
  },
  {
    question: 'What types of plants do you recommend?',
    answer: 'We specialize in native Oklahoma plants and drought-tolerant varieties that thrive in our climate. Options include perennials, annuals, shrubs, and ornamental grasses tailored to your preferences.',
  },
  {
    question: 'When is the best time to install a flower bed?',
    answer: 'Spring (March-May) and fall (September-October) are ideal for planting in Oklahoma. However, we can install beds year-round with proper care considerations.',
  },
  {
    question: 'Do you offer maintenance services?',
    answer: 'Yes! We offer seasonal cleanup packages to refresh mulch, prune plants, and remove weeds. Many customers combine this with our lawn care service.',
  },
  {
    question: 'How long will the plants last?',
    answer: 'Perennials come back year after year, while annuals last one season. We\'ll design a mix based on your preferences and budget. Native plants typically require less replacement.',
  },
  {
    question: 'What\'s included in the 50% deposit?',
    answer: 'The deposit covers material ordering (plants, soil, mulch, edging). The remaining 50% is due upon completion.',
  },
]

export default function FlowerBedsPage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative bg-forest-green pt-20"
        style={{
          backgroundImage: "url('/api/assets/service-landscaping-design.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-12">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Landscaping &amp; Design
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Transform your landscape with beautiful, custom designs that add color and curb appeal year-round.
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
                Want a Yard That Makes Your Neighbors Jealous?
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                A well-designed flower bed can completely transform your home's curb appeal. But getting it right is harder than it looks.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Maybe you've tried DIY flower beds before, only to watch plants die within weeks because they weren't suited for our Oklahoma climate. Or you've hired someone who created beds that looked great for a month, then turned into a weedy mess.
              </p>
              <p className="text-lg text-gray-600">
                <strong>You need a flower bed that looks great AND lasts.</strong>
              </p>
            </div>

            <div className="bg-vibrant-gold-50 border-l-4 border-forest-green p-6 rounded-lg">
              <h3 className="text-xl font-heading font-bold text-forest-green mb-3">
                Our Approach to Flower Beds:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Climate-smart plant selection.</strong> We only use plants that thrive in Oklahoma's heat, humidity, and occasional cold snaps.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Proper soil preparation.</strong> We don't cut corners. Quality compost and soil amendments set your plants up for success.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Year-round color.</strong> We design beds with a mix of perennials and seasonals so something's always blooming.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Low-maintenance options.</strong> We can design beds that look amazing without requiring constant attention.</span>
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
      <ServiceCTA
        title="Ready to Transform Your Landscape?"
        description="Get a free consultation and custom landscaping design. No obligation, just ideas and a detailed quote."
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Landscaping & Design Services',
  description: 'Custom landscaping and design services in Arkansas and Oklahoma, including flower bed installs, plant selection, mulch, and layout planning.',
  path: '/services/flower-beds/',
})
