import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import { ServiceShowcase } from '@/components/services/ServiceShowcase'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site.config'

const check = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const features = [
  { icon: check, title: 'Seasonal Tune-Ups', description: 'Spring and fall maintenance that keeps your system efficient and catches problems early.' },
  { icon: check, title: 'Mini-Split Installs', description: 'Ductless mini-splits for additions, shops, and rooms that never stay comfortable.' },
  { icon: check, title: 'Lower Bills, Longer Life', description: 'Regular maintenance lowers energy use and helps your equipment last years longer.' },
]

const showcaseItems = [
  {
    eyebrow: 'See the difference',
    title: 'What a Dirty Coil Is Costing You',
    body: 'Both of these coils came off working systems. The caked-on dirt on the right chokes airflow and forces the unit to run longer, hotter, and harder, which drives your power bill up month after month and wears the system out early. The clean coil on the left moves heat the way it is supposed to: lower bills, fewer breakdowns, and equipment that lasts.',
    image: '/api/assets/services/maintenance/coil-clean-vs-dirty.jpg',
    alt: 'A clean HVAC evaporator coil next to a coil caked in dirt, side by side',
  },
  {
    eyebrow: 'The result',
    title: 'Cleaned, Inspected, and Running Right',
    body: 'This is a coil right after a Service Efficiency Agreement visit. With the SEA, we clean and inspect your system twice a year, in spring and fall, at no extra charge, so it never gets to the state you saw above. You stay comfortable, your bills stay lower, and small problems get caught before they become expensive ones.',
    image: '/api/assets/services/maintenance/coil-cleaned.jpg',
    alt: 'A freshly cleaned HVAC condenser coil with water still beading on the fins',
  },
]

const process = [
  { number: '1', title: 'Schedule a Visit', description: 'Book a tune-up or a mini-split consultation at a time that works for you.' },
  { number: '2', title: 'Inspect and Service', description: 'We clean, check, and tune your system, or assess the best ductless solution for your space.' },
  { number: '3', title: 'Report and Recommend', description: 'You get a clear summary of what we did and any honest recommendations, no pressure.' },
]

const faqs = [
  { question: 'What is the Service Efficiency Agreement?', answer: 'It is our maintenance plan: we clean and inspect your system twice a year, in spring and fall at no extra charge, to keep it efficient and catch small problems before they become costly repairs.' },
  { question: 'How often should I get a tune-up?', answer: 'Twice a year is ideal, once in spring for cooling and once in fall for heating, which is exactly what the Service Efficiency Agreement covers.' },
  { question: 'What is a mini-split and do I need one?', answer: 'A ductless mini-split heats and cools a specific area without ductwork. They are great for additions, shops, and rooms that stay too hot or cold.' },
  { question: 'Will maintenance really lower my bills?', answer: 'Yes. A clean, tuned system runs more efficiently, which lowers energy use and helps prevent costly breakdowns.' },
]

export default function MaintenancePage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Maintenance &amp; Mini-Splits
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              Seasonal tune-ups and ductless mini-split installs that lower your bills and extend the life of your equipment.
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
            <h2 className="text-h2 font-heading text-forest-green mb-4">Keep It Running Right.</h2>
            <p className="text-lg text-gray-600 mb-4">The cheapest repair is the one you never need. Regular tune-ups keep your system efficient, catch small problems early, and help your equipment last for years.</p>
            <p className="text-lg text-gray-600">Have a space that never stays comfortable? A ductless mini-split is an efficient way to heat and cool additions, shops, and problem rooms without adding ductwork.</p>
          </div>
        </div>
      </section>

      <ServiceShowcase
        heading="The Service Efficiency Agreement"
        intro="A dirty coil quietly raises your power bill, strains the compressor, and shortens your system's life. Our Service Efficiency Agreement keeps it clean and running right, year-round."
        items={showcaseItems}
      />

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      <ServiceCTA
        title="Ask About the Service Efficiency Agreement"
        description={`Lock in spring and fall cleanings, lower bills, and fewer breakdowns. Call ${siteConfig.phone} or request a visit below.`}
        buttonText="Get Started"
        buttonLink="/quote-request"
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'HVAC Maintenance, Coil Cleaning & Mini-Splits in El Dorado, AR',
  description: 'Seasonal HVAC tune-ups, coil cleaning, and the Service Efficiency Agreement in El Dorado, Arkansas. Lower bills, fewer breakdowns, longer equipment life. Ductless mini-split installation too.',
  path: '/services/pressure-washing/',
})
