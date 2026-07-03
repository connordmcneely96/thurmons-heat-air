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
  { icon: check, title: 'Home & Business', description: 'Ventilation solutions for residential, commercial, and industrial spaces of every size.' },
  { icon: check, title: 'Warehouse & Industrial Fans', description: 'Large-scale ventilation and fans for warehouses, shops, and manufacturing facilities.' },
  { icon: check, title: 'Healthier Indoor Air', description: 'Proper ventilation removes stale air and moisture for a healthier, more comfortable space.' },
]

const process = [
  { number: '1', title: 'Assess the Space', description: 'We evaluate your building, airflow needs, and the challenges specific to your space.' },
  { number: '2', title: 'Design the System', description: 'We design the right ventilation solution and give you an upfront quote, with financing available.' },
  { number: '3', title: 'Install and Verify', description: 'We install the system and confirm it is moving air the way it should before we finish.' },
]

const faqs = [
  { question: 'Do you ventilate warehouses and shops?', answer: 'Yes. We handle large-scale ventilation including fans for big warehouses, manufacturing facilities, and shops.' },
  { question: 'Is ventilation only for commercial buildings?', answer: 'No. We design ventilation for residential, commercial, and industrial spaces alike.' },
  { question: 'Why does ventilation matter?', answer: 'Good ventilation removes stale air, controls moisture, and keeps indoor air healthier and more comfortable year-round.' },
  { question: 'Do you offer financing on ventilation work?', answer: 'Yes. Financing through Synchrony is available. Just ask us about options when we quote your project.' },
]

export default function VentilationPage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Ventilation Services
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Healthy, well-moving air for homes, offices, and warehouses, from exhaust fans to large-scale industrial ventilation.
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
            <h2 className="text-h2 font-heading text-forest-green mb-4">Optimal Air Quality &amp; Ventilation Efficiency</h2>
            <p className="text-lg text-gray-600 mb-4">Proper ventilation is essential to a healthy, comfortable building, whether it is a home, an office, or a large warehouse. Stale air and trapped moisture make spaces uncomfortable and can affect air quality.</p>
            <p className="text-lg text-gray-600">We assess, design, and install ventilation systems built for your space, including fans for big warehouses and industrial facilities. Ask us about financing options on larger projects.</p>
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
  title: 'Ventilation Services in El Dorado, AR | Residential & Commercial',
  description: 'Ventilation services for homes, offices, and warehouses in El Dorado, Arkansas. Large-scale industrial fans, healthier indoor air, and financing available.',
  path: '/services/ventilation/',
})
