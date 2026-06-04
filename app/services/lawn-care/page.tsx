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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Professional Mowing',
    description: 'Precision cutting with commercial-grade equipment for a perfectly manicured lawn.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Edging & Trimming',
    description: 'Crisp, clean edges along walkways, driveways, and flower beds for a polished look.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    title: 'Debris Cleanup',
    description: 'All clippings removed and disposed of properly. We leave your yard spotless.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Flexible Scheduling',
    description: 'Weekly, bi-weekly, or custom schedules that fit your needs and budget.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: '24-Hour Reminders',
    description: 'Automatic text or email reminders sent the day before each scheduled service.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Satisfaction Guarantee',
    description: 'If you\'re not happy with our work, we\'ll come back and make it right. No charge.',
  },
]

const process = [
  {
    number: '1',
    title: 'Initial Consultation',
    description: 'We visit your property to assess lawn size, conditions, and any special requirements. You\'ll receive a detailed quote within 24 hours.',
  },
  {
    number: '2',
    title: 'Schedule Setup',
    description: 'Choose your preferred schedule (weekly or bi-weekly). We\'ll set up automatic reminders and add you to our route.',
  },
  {
    number: '3',
    title: 'Consistent Service',
    description: 'Our crew arrives on your scheduled day, mows, edges, trims, and cleans up all debris. Same high quality every single time.',
  },
  {
    number: '4',
    title: 'Easy Payments',
    description: 'Choose monthly invoicing or pay-as-you-go. We accept all major credit cards and offer auto-pay options.',
  },
]

const faqs = [
  {
    question: 'How much does lawn care cost?',
    answer: 'Our pricing depends on lawn size, frequency, and location. Most residential lawns in El Dorado range from $35-$60 per visit for weekly service. We provide exact quotes after an initial site visit.',
  },
  {
    question: 'What if it rains on my scheduled day?',
    answer: 'We monitor weather closely and reschedule rain-outs for the next available day. You\'ll receive a notification if your service day changes.',
  },
  {
    question: 'Do I need to be home during service?',
    answer: 'Nope! As long as we can access your lawn and any gates are unlocked, we can complete the work while you\'re away. We\'ll send you a notification when we\'re done.',
  },
  {
    question: 'What happens if I\'m not satisfied?',
    answer: 'We stand behind our work 100%. If you\'re not happy with the results, just let us know within 24 hours and we\'ll come back to make it right at no additional charge.',
  },
  {
    question: 'Can I cancel or pause service?',
    answer: 'Yes! There are no long-term contracts for our standard lawn care. We just ask for 1 week notice if you need to cancel or pause your service.',
  },
  {
    question: 'Do you offer any discounts?',
    answer: 'We offer a 10% discount for customers who sign up for recurring service (4+ months). We also have seasonal promotions throughout the year.',
  },
  {
    question: 'What equipment do you use?',
    answer: 'We use commercial-grade zero-turn mowers, professional trimmers, and edgers. All equipment is well-maintained and serviced regularly for the best results.',
  },
]

export default function LawnCarePage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative bg-forest-green pt-20"
        style={{
          backgroundImage: "url('/api/assets/service-lawn-care.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-12">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Lawn Care &amp; Maintenance
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Keep your lawn looking pristine year-round with our professional mowing, edging, and trimming services.
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
                Tired of Spending Your Weekends Pushing a Mower?
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                We get it. Between work, family, and everything else on your plate, the last thing you want to do is spend your Saturday sweating in the Arkansas heat or dealing with Oklahoma's unpredictable weather.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Maybe you've tried hiring someone before, only to deal with unreliable service, inconsistent results, or crews that don't show up when they say they will. Or worse – they do show up, but leave your yard looking worse than before.
              </p>
              <p className="text-lg text-gray-600">
                <strong>You deserve better.</strong>
              </p>
            </div>

            <div className="bg-vibrant-gold-50 border-l-4 border-forest-green p-6 rounded-lg">
              <h3 className="text-xl font-heading font-bold text-forest-green mb-3">
                Here's How We're Different:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>We show up on time, every time.</strong> Our crews follow a strict schedule and you'll get reminders 24 hours before each service.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Consistent, professional results.</strong> Same crew, same equipment, same high standards. No surprises.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Complete cleanup.</strong> We don't just cut and run. All clippings are removed and disposed of properly.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-forest-green mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Clear communication.</strong> Questions? Call or text. We respond within 24 hours, guaranteed.</span>
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
      <ServiceCTA />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Lawn Care & Maintenance Services',
  description: 'Professional lawn care and maintenance services in Arkansas and Oklahoma, including mowing, edging, trimming, and seasonal turf support.',
  path: '/services/lawn-care/',
})
