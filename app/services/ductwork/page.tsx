import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import { ServiceShowcase } from '@/components/services/ServiceShowcase'
import { ServiceGallery } from '@/components/services/ServiceGallery'
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

const showcaseItems = [
  {
    eyebrow: 'The warning sign',
    title: 'When Your Vents Look Like This',
    body: 'Dark staining and mold around a register is not just a cleaning problem. It usually means humid, unconditioned air is leaking through poorly sealed ductwork and condensing on the cold metal at the vent. Wiping it off does not fix it, because the real cause is hidden above the ceiling.',
    image: '/api/assets/services/ductwork/vent-mold.jpg',
    alt: 'A ceiling supply vent ringed with dark mold and staining from duct air leakage',
  },
  {
    eyebrow: 'The hidden cause',
    title: 'The Real Problem Is Above the Ceiling',
    body: 'This is what we find in the attic on a lot of homes: flex duct that is torn, crushed, and disconnected, packed in with debris. Air your system paid to cool is dumping into the attic instead of your rooms, and dust and attic air get pulled into the supply. No thermostat setting fixes ductwork in this shape.',
    image: '/api/assets/services/ductwork/attic-duct-damaged.jpg',
    alt: 'Torn and crushed attic flex ductwork surrounded by debris and loose insulation',
  },
  {
    eyebrow: 'What it costs you',
    title: 'Every Leak Is Air You Already Paid For',
    body: 'Where the insulation has split open and the bare duct is exposed, conditioned air escapes and warm humid air sneaks in. That is the one-two punch behind high power bills, rooms that never balance out, and the condensation that feeds the mold you saw at the vent. Sealed, properly sized duct stops all three.',
    image: '/api/assets/services/ductwork/duct-insulation-torn.jpg',
    alt: 'HVAC duct with its insulation torn open, exposing bare metal where conditioned air leaks',
  },
  // NOTE: Finished ductwork job "after" photo coming next week — add as the closing item:
  // {
  //   eyebrow: 'Done right',
  //   title: 'Sealed, Sized, and Balanced',
  //   body: '...',
  //   image: '/api/assets/services/ductwork/finished-job.jpg',
  //   alt: '...',
  // },
]

const galleryImages = [
  {
    src: '/api/assets/services/ductwork/vent-mold-2.jpg',
    alt: 'A second ceiling supply vent with mold and a corroded register',
    caption: 'Another home, same story: mold and a corroded register fed by leaky duct.',
  },
  {
    src: '/api/assets/services/ductwork/attic-duct-2.jpg',
    alt: 'Aging attic flex ductwork connected to a metal plenum box',
    caption: 'Aging attic ducts and plenum, leaking conditioned air at the seams.',
  },
  {
    src: '/api/assets/services/ductwork/duct-bare-rusted.jpg',
    alt: 'A duct run with insulation fallen away, exposing bare, rusting metal',
    caption: 'Insulation slid off this run, leaving bare metal and rust at the joints.',
  },
]

const process = [
  { number: '1', title: 'Assess Your Airflow', description: 'We inspect your existing ducts and find where air is leaking or not reaching.' },
  { number: '2', title: 'Design and Quote', description: 'You get a custom ductwork plan and an upfront price before any work begins.' },
  { number: '3', title: 'Install and Balance', description: 'We install the new system and balance airflow so every room is comfortable.' },
]

const faqs = [
  { question: 'How do I know if my ductwork is the problem?', answer: 'Uneven temperatures room to room, weak airflow, mold or staining around your vents, and higher-than-expected energy bills often point to leaky or poorly designed ductwork.' },
  { question: 'Why is there mold around my vents?', answer: 'It usually means humid air is leaking through unsealed ductwork and condensing on the cold register. Sealing and correcting the ductwork addresses the cause, not just the symptom.' },
  { question: 'Do you remove the old duct system?', answer: 'Yes. When we replace ductwork, we remove the old system and install the new one cleanly.' },
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

      <ServiceShowcase
        heading="Why Ductwork Matters"
        intro="Uneven rooms and high power bills usually start in the ducts. Here is what failing ductwork actually looks like, and why sealing and sizing it correctly changes everything."
        items={showcaseItems}
      />

      <ServiceGallery
        heading="More From the Field"
        intro="A few more inspections around El Dorado. Different homes, same story: ductwork quietly costing comfort and money."
        images={galleryImages}
      />

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      <ServiceCTA
        title="Think Your Ducts Are the Problem?"
        description={`We will inspect your system, find the leaks, and give you an upfront plan. Call ${siteConfig.phone} or request a free estimate.`}
        buttonText="Get a Free Estimate"
        buttonLink="/quote-request"
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Ductwork Installation & Repair in El Dorado, AR',
  description: 'Custom ductwork design, installation, and replacement in El Dorado, Arkansas. Fix uneven airflow, hot and cold spots, and mold at the vents caused by leaky, poorly sealed ducts.',
  path: '/services/ductwork/',
})
