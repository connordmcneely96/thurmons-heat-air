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
  { icon: check, title: 'Furnace & Heat Pump Repair', description: 'We fix gas furnaces, electric heat, and heat pumps so your home stays warm all winter.' },
  { icon: check, title: 'No-Heat Emergencies', description: 'Lost heat on a cold night? We offer 24/7 emergency service to get you warm fast.' },
  { icon: check, title: 'Safety Checks Included', description: 'Every heating visit includes a safety check on connections, ignition, and airflow.' },
]

const process = [
  { number: '1', title: 'Tell Us the Symptoms', description: 'Call or book online and describe what your system is doing. We schedule you quickly.' },
  { number: '2', title: 'Inspect and Quote', description: 'We find the cause, check for safety issues, and give you an upfront price before work begins.' },
  { number: '3', title: 'Repair and Test', description: 'We complete the repair and verify safe, steady heat before we leave your home.' },
]

const faqs = [
  { question: 'My heat went out tonight. Can you help?', answer: 'Yes. We offer 24/7 emergency service for no-heat situations, especially during cold snaps.' },
  { question: 'Do you work on heat pumps and gas furnaces?', answer: 'Both. Our techs service heat pumps, gas furnaces, and electric heating systems of all major brands.' },
  { question: 'How do I know if I should repair or replace?', answer: 'We give you an honest assessment. If a repair is the smart move, we repair it. We only suggest replacement when it truly saves you money.' },
  { question: 'Is the safety check really included?', answer: 'Yes. We check connections, ignition, and airflow on every heating service so your system runs safely.' },
]

export default function HeatingPage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Heating &amp; Furnace Service
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Furnace and heat pump repair, tune-ups, and replacement to keep your home warm through every South Arkansas cold snap.
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
            <h2 className="text-h2 font-heading text-forest-green mb-4">Warm Home, No Worries.</h2>
            <p className="text-lg text-gray-600 mb-4">When the temperature drops and your heat will not keep up, you want a fast, reliable fix from a company you trust. We service every major type of heating system.</p>
            <p className="text-lg text-gray-600">We find the problem, check the system for safety, and give you a clear price up front. Honest work that keeps your family comfortable.</p>
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
  title: 'Heating & Furnace Repair in El Dorado, AR',
  description: 'Furnace and heat pump repair, tune-ups, and replacement in El Dorado, Arkansas. 24/7 emergency heat service with upfront pricing.',
  path: '/services/flower-beds/',
})
