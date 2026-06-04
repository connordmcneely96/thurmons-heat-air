import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site.config'

const check = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const features = [
  { icon: check, title: 'Fast Diagnosis', description: 'We pinpoint the problem quickly and explain it in plain language before any work begins.' },
  { icon: check, title: 'Any Make or Model', description: 'Our techs service all major brands of central AC, heat pumps, and ductless systems.' },
  { icon: check, title: 'Same-Day Service', description: 'When your AC quits in the Arkansas heat, we move fast to get your home cool again.' },
]

const process = [
  { number: '1', title: 'Call or Book Online', description: 'Reach out and tell us what is going on. We schedule you fast, including emergency calls.' },
  { number: '2', title: 'Diagnose and Quote', description: 'We inspect the system, find the issue, and give you an upfront price before we start.' },
  { number: '3', title: 'Repair and Verify', description: 'We make the repair and test the system to confirm it is running right before we leave.' },
]

const faqs = [
  { question: 'How fast can you come out?', answer: 'In most cases we offer same-day service for AC repairs, with 24/7 emergency availability for no-cool situations.' },
  { question: 'Do you charge a service call fee?', answer: 'We will explain any diagnostic or service call fee up front when you book, so there are no surprises.' },
  { question: 'What brands do you service?', answer: 'We repair all major makes and models of central air, heat pumps, and mini-split systems.' },
  { question: 'Will you try to sell me a new unit?', answer: 'No pressure. If a repair makes sense we repair it. We only recommend replacement when it is genuinely the better value for you.' },
]

export default function ACRepairPage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              AC Repair &amp; Service
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Fast, dependable air conditioning repair for El Dorado homes and businesses. We get your cooling back, often the same day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quote-request"><Button variant="primary" size="lg" className="w-full sm:w-auto">Get Free Estimate</Button></Link>
              <a href={`tel:${siteConfig.phoneRaw}`}><Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-forest-green">Call {siteConfig.phone}</Button></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading text-forest-green mb-4">No Cool Air? We Will Find Out Why.</h2>
            <p className="text-lg text-gray-600 mb-4">A failing AC always seems to quit on the hottest day of the year. You need someone local who answers the phone, shows up fast, and fixes it right the first time.</p>
            <p className="text-lg text-gray-600">We diagnose the real problem, give you an honest price before we start, and stand behind the work. No guesswork, no pressure to replace a system that can be repaired.</p>
          </div>
        </div>
      </section>

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      <ServiceCTA />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'AC Repair & Air Conditioning Service in El Dorado, AR',
  description: 'Fast, dependable AC repair in El Dorado, Arkansas. Same-day service, upfront pricing, all major brands. Call Thurmon\u2019s Heat & Air.',
  path: '/services/lawn-care/',
})
