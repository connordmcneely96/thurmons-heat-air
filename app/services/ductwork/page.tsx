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
  { icon: check, title: 'Custom Duct Design', description: 'We design and install ductwork sized to your space so conditioned air reaches every room evenly.' },
  { icon: check, title: 'Fix Uneven Airflow', description: 'Hot and cold spots usually trace back to bad ductwork. We find the cause and correct it.' },
  { icon: check, title: 'Old Duct Removal', description: 'Replacing a tired, leaky duct system? We remove the old ductwork and install the new cleanly.' },
]

const process = [
  { number: '1', title: 'Assess Your Airflow', description: 'We inspect your existing ducts and find where air is leaking or not reaching.' },
  { number: '2', title: 'Design and Quote', description: 'You get a custom ductwork plan and an upfront price before any work begins.' },
  { number: '3', title: 'Install and Balance', description: 'We install the new system and balance airflow so every room is comfortable.' },
]

const faqs = [
  { question: 'How do I know if my ductwork is the problem?', answer: 'Uneven temperatures room to room, weak airflow, and higher-than-expected energy bills often point to leaky or poorly designed ductwork.' },
  { question: 'Do you remove the old duct system?', answer: 'Yes. When we replace ductwork, we remove the old system and install the new one cleanly.' },
  { question: 'Do you handle new construction?', answer: 'Yes. Whether you are building new or upgrading an existing system, we design and install ductwork for the space.' },
  { question: 'Will new ductwork lower my bills?', answer: 'Often, yes. Sealed, properly sized ducts stop wasting conditioned air, which improves comfort and efficiency.' },
]

export default function DuctworkPage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Ductwork Installation &amp; Repair
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Even airflow in every room. We design, install, and replace ductwork for consistent comfort across your home or business.
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
            <h2 className="text-h2 font-heading text-forest-green mb-4">Get Consistent Air Flow Throughout Your Space</h2>
            <p className="text-lg text-gray-600 mb-4">One room is freezing while another never cools down. More often than not, the real problem is the ductwork, not the unit. Leaky or poorly designed ducts waste the air your system works hard to produce.</p>
            <p className="text-lg text-gray-600">We design custom ductwork that maximizes airflow and distributes conditioned air evenly, and we can remove your old duct system in the process. The result is steady comfort and lower waste.</p>
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
  title: 'Ductwork Installation & Repair in El Dorado, AR',
  description: 'Custom ductwork design, installation, and replacement in El Dorado, Arkansas. Fix uneven airflow and hot or cold spots with even, efficient air distribution.',
  path: '/services/ductwork/',
})
